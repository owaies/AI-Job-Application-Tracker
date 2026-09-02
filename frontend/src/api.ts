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

const emptyAnalytics: ApplicationAnalytics = { total: 0, active: 0, interviews: 0, offers: 0, by_status: {} }

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
  me: (token: string) => request<User>('/api/auth/me', {}, token),
  applications: async (token: string, search = '', status = '') => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (status) params.set('status', status)
    const query = params.toString()
    try {
      return await request<JobApplication[]>(`/api/applications${query ? `?${query}` : ''}`, {}, token)
    } catch (error) {
      if (!isRecoverableDataError(error)) throw error
      console.error('Applications request failed', error)
      return []
    }
  },
  analytics: async (token: string) => {
    try {
      return await request<ApplicationAnalytics>('/api/applications/analytics', {}, token)
    } catch (error) {
      if (!isRecoverableDataError(error)) throw error
      console.error('Analytics request failed', error)
      return emptyAnalytics
    }
  },
  smartActions: async (token: string) => {
    try {
      return await request<SmartAction[]>('/api/applications/smart-actions', {}, token)
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
