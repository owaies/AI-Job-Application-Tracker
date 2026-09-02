import { Component, ErrorInfo, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message: string; stack: string; componentStack: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '', stack: '', componentStack: '' }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unexpected application error',
      stack: error instanceof Error ? error.stack ?? '' : '',
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('JobTrack render failure', error, info.componentStack)
    this.setState({ componentStack: info.componentStack ?? '' })
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '', stack: '', componentStack: '' })
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
          {(this.state.stack || this.state.componentStack) && (
            <details className="error-diagnostics">
              <summary>SHOW RENDER DIAGNOSTICS</summary>
              <pre>{`${this.state.stack}\n\nREACT COMPONENT STACK\n${this.state.componentStack}`}</pre>
            </details>
          )}
          <button type="button" className="btn" onClick={this.handleRetry}>RETRY RENDER →</button>
        </section>
      </main>
    )
  }
}
