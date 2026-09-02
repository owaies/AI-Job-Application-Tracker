import { Component, ErrorInfo, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unexpected application error',
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('JobTrack render failure', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="error-shell">
        <section className="error-card" role="alert">
          <span className="kicker">JOBTRACK / RENDER ERROR</span>
          <h1>Dashboard<br /><em>interrupted.</em></h1>
          <p>The application hit an unexpected rendering error. Your authentication session is preserved.</p>
          <code>{this.state.message}</code>
          <button type="button" className="btn" onClick={this.handleRetry}>RETRY RENDER →</button>
        </section>
      </main>
    )
  }
}
