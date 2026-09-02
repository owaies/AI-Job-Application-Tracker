const API_URL = import.meta.env.VITE_API_URL ?? '/api'

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

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail ?? 'Request failed')
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

export const api = {
  register: (email: string, password: string, fullName: string) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, full_name: fullName }) }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: (token: string) => request<User>('/api/auth/me', {}, token),
  applications: (token: string, search = '', status = '') => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (status) params.set('status', status)
    const query = params.toString()
    return request<JobApplication[]>(`/api/applications${query ? `?${query}` : ''}`, {}, token)
  },
  analytics: (token: string) => request<ApplicationAnalytics>('/api/applications/analytics', {}, token),
  smartActions: (token: string) => request<SmartAction[]>('/api/applications/smart-actions', {}, token),
  createApplication: (token: string, data: Partial<JobApplication>) =>
    request<JobApplication>('/api/applications', { method: 'POST', body: JSON.stringify(data) }, token),
  updateApplication: (token: string, id: number, data: Partial<JobApplication>) =>
    request<JobApplication>(`/api/applications/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  deleteApplication: (token: string, id: number) =>
    request<void>(`/api/applications/${id}`, { method: 'DELETE' }, token),
}
