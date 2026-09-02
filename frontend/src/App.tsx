import { FormEvent, useEffect, useState } from 'react'
import { api, ApplicationAnalytics, JobApplication, SmartAction, User } from './api'

const STATUSES = ['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn']
const PRIORITIES = ['low', 'medium', 'high']
const TOKEN_KEY = 'job-tracker-token'

type FormState = {
  company: string; role: string; location: string; status: string; priority: string; salary: string
  follow_up_date: string; interview_date: string; next_action: string; notes: string
}
const emptyForm: FormState = { company: '', role: '', location: '', status: 'applied', priority: 'medium', salary: '', follow_up_date: '', interview_date: '', next_action: '', notes: '' }

function toLocalInput(value: string | null) {
  return value ? value.slice(0, 16) : ''
}

function toForm(application: JobApplication): FormState {
  return {
    company: application.company, role: application.role, location: application.location ?? '', status: application.status,
    priority: application.priority, salary: application.salary ?? '', follow_up_date: toLocalInput(application.follow_up_date),
    interview_date: toLocalInput(application.interview_date), next_action: application.next_action ?? '', notes: application.notes ?? '',
  }
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [analytics, setAnalytics] = useState<ApplicationAnalytics | null>(null)
  const [smartActions, setSmartActions] = useState<SmartAction[]>([])
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const refresh = async (accessToken: string, query = search, filter = statusFilter) => {
    setLoading(true)
    try {
      const [items, summary, actions] = await Promise.all([api.applications(accessToken, query, filter), api.analytics(accessToken), api.smartActions(accessToken)])
      setApplications(items); setAnalytics(summary); setSmartActions(actions); setError('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load applications') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!token) return
    api.me(token).then(setUser).then(() => refresh(token)).catch(() => {
      localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null)
    })
  }, [token])

  useEffect(() => {
    if (!token || !user) return
    const timer = window.setTimeout(() => refresh(token, search, statusFilter), 250)
    return () => window.clearTimeout(timer)
  }, [search, statusFilter])

  const submitAuth = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const result = authMode === 'login' ? await api.login(email, password) : await api.register(email, password, fullName)
      localStorage.setItem(TOKEN_KEY, result.access_token); setToken(result.access_token); setUser(result.user)
    } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed') }
    finally { setLoading(false) }
  }

  const submitApplication = async (event: FormEvent) => {
    event.preventDefault(); if (!token) return
    setLoading(true); setError('')
    try {
      const payload = {
        ...form,
        location: form.location || null, salary: form.salary || null, notes: form.notes || null,
        follow_up_date: form.follow_up_date ? new Date(form.follow_up_date).toISOString() : null,
        interview_date: form.interview_date ? new Date(form.interview_date).toISOString() : null,
        next_action: form.next_action || null,
      }
      if (editingId) { await api.updateApplication(token, editingId, payload); setEditingId(null) }
      else await api.createApplication(token, payload)
      setForm(emptyForm); await refresh(token)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save application') }
    finally { setLoading(false) }
  }

  const startEdit = (application: JobApplication) => { setEditingId(application.id); setForm(toForm(application)); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const deleteApplication = async (id: number) => {
    if (!token || !window.confirm('Delete this application? This cannot be undone.')) return
    setLoading(true); setError('')
    try { await api.deleteApplication(token, id); await refresh(token) }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not delete application') }
    finally { setLoading(false) }
  }

  const logout = () => { localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); setApplications([]); setAnalytics(null); setSmartActions([]) }

  if (!token || !user) return <main className="auth-shell"><section className="auth-card"><span className="eyebrow">AI JOB APPLICATION TRACKER</span><h1>Own your job search.</h1><p>Track applications, keep follow-ups visible, and turn a scattered search into a measurable pipeline.</p><form onSubmit={submitAuth} className="form-stack">
    {authMode === 'register' && <label>Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label>}
    <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
    <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required /></label>
    {error && <div className="error">{error}</div>}<button disabled={loading}>{loading ? 'Working…' : authMode === 'login' ? 'Sign in' : 'Create account'}</button>
  </form><button className="link-button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError('') }}>{authMode === 'login' ? 'Create a new account' : 'Already have an account? Sign in'}</button></section></main>

  const summaryCards = [['Total', analytics?.total ?? applications.length], ['Active', analytics?.active ?? 0], ['Interviews', analytics?.interviews ?? 0], ['Offers', analytics?.offers ?? 0]]

  return <main className="app-shell"><header className="topbar"><div><span className="eyebrow">JOB SEARCH COMMAND CENTER</span><h1>{user.full_name ? `Welcome, ${user.full_name}.` : 'Welcome back.'}</h1><p>{user.email}</p></div><button className="secondary" onClick={logout}>Sign out</button></header>
    {error && <div className="error banner">{error}</div>}
    <section className="stat-grid">{summaryCards.map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
    <section className="content-grid"><article className="panel"><div className="panel-heading"><div><span className="eyebrow">{editingId ? 'EDIT APPLICATION' : 'NEW APPLICATION'}</span><h2>{editingId ? 'Update role' : 'Add a role'}</h2></div></div><form onSubmit={submitApplication} className="form-stack">
      <div className="two-col"><label>Company<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required /></label><label>Role<input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required /></label></div>
      <div className="two-col"><label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote / Bengaluru" /></label><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label></div>
      <div className="two-col"><label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}</select></label><label>Salary<input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="Optional" /></label></div>
      <div className="two-col"><label>Follow-up date<input type="datetime-local" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} /></label><label>Interview date<input type="datetime-local" value={form.interview_date} onChange={(e) => setForm({ ...form, interview_date: e.target.value })} /></label></div>
      <label>Next action<input value={form.next_action} onChange={(e) => setForm({ ...form, next_action: e.target.value })} placeholder="e.g. Email recruiter" /></label>
      <label>Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></label>
      <div className="two-col"><button disabled={loading}>{loading ? 'Saving…' : editingId ? 'Save changes' : 'Add application'}</button>{editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancel</button>}</div>
    </form></article>
    <article className="panel"><div className="panel-heading"><div><span className="eyebrow">PIPELINE</span><h2>Your applications</h2></div><span>{applications.length} shown</span></div><div className="two-col"><label>Search<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Company, role or location" /></label><label>Filter by status<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">All statuses</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label></div>{loading && applications.length === 0 ? <p>Loading applications…</p> : applications.length === 0 ? <p className="empty">No matching applications. Try another filter or add a role.</p> : <div className="application-list">{applications.map((item) => <div className="application" key={item.id}><div><strong>{item.role}</strong><span>{item.company} · {item.location || 'Location not set'}</span><small>{item.priority} priority{item.follow_up_date ? ` · follow up ${new Date(item.follow_up_date).toLocaleDateString()}` : ''}</small></div><div className="application-actions"><span className={`badge badge-${item.status}`}>{item.status}</span><button className="small secondary" onClick={() => startEdit(item)}>Edit</button><button className="small danger" onClick={() => deleteApplication(item.id)}>Delete</button></div></div>)}</div>}</article></section>
    <section className="panel analytics-panel"><div className="panel-heading"><div><span className="eyebrow">ANALYTICS</span><h2>Pipeline health</h2></div></div><div className="status-breakdown">{STATUSES.map((status) => <div key={status}><span>{status}</span><strong>{analytics?.by_status[status] ?? 0}</strong></div>)}</div></section>
    <section className="panel smart-panel"><div className="panel-heading"><div><span className="eyebrow">SMART ACTIONS</span><h2>What deserves attention next</h2></div><span>{smartActions.length} suggestions</span></div>{smartActions.length === 0 ? <p className="empty">No urgent actions. Keep adding applications and dates to get useful reminders.</p> : <div className="smart-list">{smartActions.slice(0, 6).map((item) => <div className="smart-item" key={item.application_id}><div><strong>{item.role} · {item.company}</strong><span>{item.recommendation}</span><small>{item.reason}</small></div><span className={`priority priority-${item.priority}`}>{item.priority}</span></div>)}</div>}</section>
  </main>
}
export default App
