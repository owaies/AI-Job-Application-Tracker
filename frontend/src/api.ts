const API_URL = ''
const REQUEST_TIMEOUT_MS = 12000
const inFlightGets = new Map<string, Promise<unknown>>()

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export type User = { id: number; email: string; full_name?: string | null }

export type JobApplication = {
  id: number
  user_id: number
  company: string
  role: string
  location: string | null
  status: string
  priority: string
  salary: string | null
  application_date: string
  follow_up_date: string | null
  interview_date: string | null
  next_action: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ApplicationAnalytics = {
  total: number
  active: number
  interviews: number
  offers: number
  by_status: Record<string, number>
}

export type SmartAction = {
  application_id: number
  company: string
  role: string
  priority: string
  recommendation: string
  reason: string
}

type AuthResponse = { access_token: string; token_type: string; user: User }

const STATUSES = new Set(['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'])
const PRIORITIES = new Set(['low', 'medium', 'high'])
const emptyAnalytics: ApplicationAnalytics = { total: 0, active: 0, interviews: 0, offers: 0, by_status: {} }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown, field: string, endpoint: string): string {
  if (typeof value !== 'string') throw new ApiError(`Invalid ${endpoint} response: ${field} must be a string`, 0)
  return value
}

function nullableString(value: unknown, field: string, endpoint: string): string | null {
  if (value === null || value === undefined) return null
  return requiredString(value, field, endpoint)
}

function requiredNumber(value: unknown, field: string, endpoint: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new ApiError(`Invalid ${endpoint} response: ${field} must be a number`, 0)
  return value
}

function normalizeUser(value: unknown): User {
  if (!isRecord(value)) throw new ApiError('Invalid /api/auth/me response: expected an object', 0)
  return {
    id: requiredNumber(value.id, 'id', '/api/auth/me'),
    email: requiredString(value.email, 'email', '/api/auth/me'),
    full_name: nullableString(value.full_name, 'full_name', '/api/auth/me'),
  }
}

function normalizeApplication(value: unknown, index: number): JobApplication {
  const endpoint = `/api/applications[${index}]`
  if (!isRecord(value)) throw new ApiError(`Invalid ${endpoint} response: expected an object`, 0)
  const status = requiredString(value.status, 'status', endpoint)
  const priority = requiredString(value.priority, 'priority', endpoint)
  if (!STATUSES.has(status)) throw new ApiError(`Invalid ${endpoint} response: status has unexpected value`, 0)
  if (!PRIORITIES.has(priority)) throw new ApiError(`Invalid ${endpoint} response: priority has unexpected value`, 0)
  return {
    id: requiredNumber(value.id, 'id', endpoint),
    user_id: requiredNumber(value.user_id, 'user_id', endpoint),
    company: requiredString(value.company, 'company', endpoint),
    role: requiredString(value.role, 'role', endpoint),
    location: nullableString(value.location, 'location', endpoint),
    status,
    priority,
    salary: nullableString(value.salary, 'salary', endpoint),
    application_date: requiredString(value.application_date, 'application_date', endpoint),
    follow_up_date: nullableString(value.follow_up_date, 'follow_up_date', endpoint),
    interview_date: nullableString(value.interview_date, 'interview_date', endpoint),
    next_action: nullableString(value.next_action, 'next_action', endpoint),
    notes: nullableString(value.notes, 'notes', endpoint),
    created_at: requiredString(value.created_at, 'created_at', endpoint),
    updated_at: requiredString(value.updated_at, 'updated_at', endpoint),
  }
}

function normalizeAnalytics(value: unknown): ApplicationAnalytics {
  if (!isRecord(value)) throw new ApiError('Invalid /api/applications/analytics response: expected an object', 0)
  if (!isRecord(value.by_status)) throw new ApiError('Invalid /api/applications/analytics response: by_status must be an object', 0)
  const byStatus: Record<string, number> = {}
  for (const [status, count] of Object.entries(value.by_status)) {
    if (typeof count !== 'number' || !Number.isFinite(count)) throw new ApiError(`Invalid analytics response: by_status.${status} must be a number`, 0)
    byStatus[status] = count
  }
  return {
    total: requiredNumber(value.total, 'total', '/api/applications/analytics'),
    active: requiredNumber(value.active, 'active', '/api/applications/analytics'),
    interviews: requiredNumber(value.interviews, 'interviews', '/api/applications/analytics'),
    offers: requiredNumber(value.offers, 'offers', '/api/applications/analytics'),
    by_status: byStatus,
  }
}

function normalizeSmartAction(value: unknown, index: number): SmartAction {
  const endpoint = `/api/applications/smart-actions[${index}]`
  if (!isRecord(value)) throw new ApiError(`Invalid ${endpoint} response: expected an object`, 0)
  const priority = requiredString(value.priority, 'priority', endpoint)
  if (!PRIORITIES.has(priority)) throw new ApiError(`Invalid ${endpoint} response: priority has unexpected value`, 0)
  return {
    application_id: requiredNumber(value.application_id, 'application_id', endpoint),
    company: requiredString(value.company, 'company', endpoint),
    role: requiredString(value.role, 'role', endpoint),
    priority,
    recommendation: requiredString(value.recommendation, 'recommendation', endpoint),
    reason: requiredString(value.reason, 'reason', endpoint),
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  const dedupeKey = method === 'GET' ? `${path}|${token ?? ''}` : ''

  if (dedupeKey) {
    const existing = inFlightGets.get(dedupeKey)
    if (existing) return existing as Promise<T>
  }

  const run = (async () => {
    const headers = new Headers(options.headers)
    if (method !== 'GET') headers.set('Content-Type', 'application/json')
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(`${API_URL}${path}`, { ...options, headers, signal: controller.signal })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new ApiError(body.detail ?? `Request failed (${response.status})`, response.status)
      }
      if (response.status === 204) return undefined as T
      return response.json()
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timed out. Please try again.', 0)
      }
      throw error
    } finally {
      window.clearTimeout(timeout)
    }
  })()

  if (dedupeKey) {
    inFlightGets.set(dedupeKey, run)
    run.finally(() => {
      if (inFlightGets.get(dedupeKey) === run) inFlightGets.delete(dedupeKey)
    }).catch(() => undefined)
  }

  return run
}

function isRecoverableDataError(error: unknown) {
  return !(error instanceof ApiError) || error.status !== 401
}

export const api = {
  register: (email: string, password: string, fullName: string) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, full_name: fullName }) }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: async (token: string) => normalizeUser(await request<unknown>('/api/auth/me', {}, token)),
  applications: async (token: string, search = '', status = '') => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (status) params.set('status', status)
    const query = params.toString()
    try {
      const data = await request<unknown>(`/api/applications${query ? `?${query}` : ''}`, {}, token)
      if (!Array.isArray(data)) throw new ApiError('Invalid /api/applications response: expected an array', 0)
      return data.map(normalizeApplication)
    } catch (error) {
      if (!isRecoverableDataError(error)) throw error
      console.error('Applications request failed', error)
      return []
    }
  },
  analytics: async (token: string) => {
    try {
      return normalizeAnalytics(await request<unknown>('/api/applications/analytics', {}, token))
    } catch (error) {
      if (!isRecoverableDataError(error)) throw error
      console.error('Analytics request failed', error)
      return emptyAnalytics
    }
  },
  smartActions: async (token: string) => {
    try {
      const data = await request<unknown>('/api/applications/smart-actions', {}, token)
      if (!Array.isArray(data)) throw new ApiError('Invalid /api/applications/smart-actions response: expected an array', 0)
      return data.map(normalizeSmartAction)
    } catch (error) {
      if (!isRecoverableDataError(error)) throw error
      console.error('Smart actions request failed', error)
      return []
    }
  },
  createApplication: (token: string, data: Partial<JobApplication>) =>
    request<JobApplication>('/api/applications', { method: 'POST', body: JSON.stringify(data) }, token),
  updateApplication: (token: string, id: number, data: Partial<JobApplication>) =>
    request<JobApplication>(`/api/applications/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  deleteApplication: (token: string, id: number) =>
    request<void>(`/api/applications/${id}`, { method: 'DELETE' }, token),
}
