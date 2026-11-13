import { Component } from 'react'
import { t } from '../i18n'

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
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => window.location.reload()} className="rounded-md border border-indigo-600 px-4 py-2.5 font-semibold text-indigo-600">
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
