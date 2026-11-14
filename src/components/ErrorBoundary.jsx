import { Component } from 'react'
import { t } from '../i18n'
import DiagnosticReport from './DiagnosticReport'

export const STORAGE_KEYS = ['nkap-transactions', 'nkap-transfers', 'nkap-commitments', 'nkap-rates', 'nkap-welcome-done']

/**
 * Last line of defence: if saved data can't be rendered, show a way to reset
 * instead of a blank page (the Settings reset button would be unreachable).
 */
class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  reset = () => {
    try {
      STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
    } catch {
      /* storage blocked: reload anyway */
    }
    window.location.assign('/')
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main role="alert" className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="font-display text-2xl font-bold">{t('errorBoundary.title')}</h1>
        <p className="text-muted">
          {t('errorBoundary.text')}
        </p>
        {/* Offered before Reset, so the user can share what went wrong first. The log is kept after Reset. */}
        <p className="text-sm text-muted">{t('diagnostics.help')}</p>
        <DiagnosticReport />
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => window.location.reload()} className="rounded-md border border-accent px-4 py-2.5 font-semibold text-accent">
            {t('errorBoundary.reload')}
          </button>
          <button type="button" onClick={this.reset} className="rounded-md bg-indigo-600 px-4 py-2.5 font-semibold text-white">
            {t('errorBoundary.reset')}
          </button>
        </div>
      </main>
    )
  }
}

export default ErrorBoundary
