import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/** Catches render-time crashes so one broken page shows a recoverable message instead of a blank site. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-navy px-6 text-center text-white">
          <h1 className="text-h2 font-display font-extrabold">Something went wrong</h1>
          <p className="max-w-md text-white/60">
            This page hit an unexpected error. Reloading usually fixes it — if it keeps happening, please let us know.
          </p>
          <Button size="lg" icon={<RefreshCw size={18} />} onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
