import { useState } from 'react'
import { diagnosticReport } from '../utils/errorLog'
import { t } from '../i18n'

/**
 * "Copy diagnostic report" button. Copies the local error log (no personal data)
 * so the user can choose to share it. If the clipboard isn't available, the
 * report is shown in a read-only box to copy by hand.
 */
function DiagnosticReport({ className = '' }) {
  const [state, setState] = useState('idle') // idle | copied | manual
  const [text, setText] = useState('')

  const copy = async () => {
    const report = diagnosticReport()
    setText(report)
    try {
      await navigator.clipboard.writeText(report)
      setState('copied')
    } catch {
      setState('manual')
    }
  }

  return (
    <div className={className}>
      <button type="button" onClick={copy} className="rounded-md border border-accent px-4 py-2.5 text-sm font-semibold text-accent hover:bg-indigo-100">
        {t('diagnostics.copy')}
      </button>
      {state === 'copied' && <p role="status" className="mt-2 text-sm text-received">{t('diagnostics.copied')}</p>}
      {state === 'manual' && (
        <label className="mt-2 block text-sm">
          {t('diagnostics.manual')}
          <textarea readOnly value={text} rows={6} className="mt-1 w-full rounded-md border border-field bg-surface p-2 font-mono text-xs" onFocus={(e) => e.target.select()} />
        </label>
      )}
    </div>
  )
}

export default DiagnosticReport
