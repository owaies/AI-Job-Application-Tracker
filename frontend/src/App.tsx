import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking API…')

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((response) => {
        if (!response.ok) throw new Error('API request failed')
        return response.json()
      })
      .then((data) => setApiStatus(data.status === 'ok' ? 'API connected' : 'API unavailable'))
      .catch(() => setApiStatus('Start the FastAPI backend'))
  }, [])

  return (
    <main className="app-shell">
      <section className="hero-card">
        <span className="eyebrow">AI JOB APPLICATION TRACKER</span>
        <h1>Turn your job search into a clear pipeline.</h1>
        <p>
          A focused workspace for applications, interviews, follow-ups, and
          data-driven job-search insights.
        </p>
        <div className="status-pill" aria-live="polite">● {apiStatus}</div>
      </section>

      <section className="stat-grid" aria-label="Application overview">
        {['Applications', 'Interviews', 'Offers', 'Follow-ups'].map((label) => (
          <article className="stat-card" key={label}>
            <span>{label}</span>
            <strong>0</strong>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
