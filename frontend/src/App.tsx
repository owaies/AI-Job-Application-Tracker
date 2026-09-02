import { FormEvent, useEffect, useState } from 'react'
import { api, JobApplication, User } from './api'

const STATUSES = ['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn']
const TOKEN_KEY = 'job-tracker-token'

type FormState = { company: string; role: string; location: string; status: string; salary: string; notes: string }
const emptyForm: FormState = { company: '', role: '', location: '', status: 'applied', salary: '', notes: '' }

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadApplications = async (accessToken: string) => {
    setLoading(true)
    try { setApplications(await api.applications(accessToken)); setError('') }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load applications') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!token) return
    api.me(token).then(setUser).then(() => loadApplications(token)).catch(() => {
      localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null)
    })
  }, [token])

  const submitAuth = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const result = authMode === 'login' ? await api.login(email, password) : await api.register(email, password, fullName)
      localStorage.setItem(TOKEN_KEY, result.access_token); setToken(result.access_token)
    } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed') }
    finally { setLoading(false) }
  }

  const submitApplication = async (event: FormEvent) => {
    event.preventDefault(); if (!token) return
    setLoading(true); setError('')
    try {
      const created = await api.createApplication(token, { ...form, location: form.location || null, salary: form.salary || null, notes: form.notes || null })
      setApplications((current) => [created, ...current]); setForm(emptyForm)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not create application') }
    finally { setLoading(false) }
  }

  const logout = () => { localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); setApplications([]) }

  if (!token || !user) return <main className="auth-shell"><section className="auth-card"><span className="eyebrow">AI JOB APPLICATION TRACKER</span><h1>Own your job search.</h1><p>Track applications, keep follow-ups visible, and turn a scattered search into a measurable pipeline.</p><form onSubmit={submitAuth} className="form-stack">
    {authMode === 'register' && <label>Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label>}
    <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
    <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required /></label>
    {error && <div className="error">{error}</div>}<button disabled={loading}>{loading ? 'Working…' : authMode === 'login' ? 'Sign in' : 'Create account'}</button>
  </form><button className="link-button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError('') }}>{authMode === 'login' ? 'Create a new account' : 'Already have an account? Sign in'}</button></section></main>

  return <main className="app-shell"><header className="topbar"><div><span className="eyebrow">JOB SEARCH COMMAND CENTER</span><h1>Welcome back{user.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}.</h1></div><button className="secondary" onClick={logout}>Sign out</button></header>
    {error && <div className="error banner">{error}</div>}
    <section className="stat-grid">{STATUSES.slice(0, 4).map((status) => <article className="stat-card" key={status}><span>{status}</span><strong>{applications.filter((item) => item.status === status).length}</strong></article>)}</section>
    <section className="content-grid"><article className="panel"><div className="panel-heading"><div><span className="eyebrow">NEW APPLICATION</span><h2>Add a role</h2></div></div><form onSubmit={submitApplication} className="form-stack"><div className="two-col"><label>Company<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required /></label><label>Role<input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required /></label></div><div className="two-col"><label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote / Bengaluru" /></label><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label></div><label>Salary<input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="Optional" /></label><label>Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></label><button disabled={loading}>{loading ? 'Saving…' : 'Add application'}</button></form></article>
    <article className="panel"><div className="panel-heading"><div><span className="eyebrow">PIPELINE</span><h2>Your applications</h2></div><span>{applications.length} total</span></div>{loading && applications.length === 0 ? <p>Loading applications…</p> : applications.length === 0 ? <p className="empty">No applications yet. Add your first role to start building the pipeline.</p> : <div className="application-list">{applications.map((item) => <div className="application" key={item.id}><div><strong>{item.role}</strong><span>{item.company} · {item.location || 'Location not set'}</span></div><span className={`badge badge-${item.status}`}>{item.status}</span></div>)}</div>}</article></section>
  </main>
}
export default App
