import { useState } from 'react'
import { useCommitmentStore } from '../store/useCommitmentStore'
import { formatXaf, xafToEur, formatEur } from '../utils/currency'
import { loadDemoData, clearAllData } from '../utils/demoData'
import TrashIcon from '../components/TrashIcon'
import DiagnosticReport from '../components/DiagnosticReport'
import BackupPanel from '../components/BackupPanel'
import { useTransactionStore } from '../store/useTransactionStore'
import { useTransferStore } from '../store/useTransferStore'
import { t, tError, langInfo } from '../i18n'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeChoice from '../components/ThemeChoice'

const fieldClass =
  'mt-1.5 w-full rounded-md border border-field bg-surface px-3.5 py-3 text-base text-ink focus:border-accent'

function Settings() {
  const commitments = useCommitmentStore((s) => s.commitments)
  const addCommitment = useCommitmentStore((s) => s.addCommitment)
  const removeCommitment = useCommitmentStore((s) => s.removeCommitment)

  const [label, setLabel] = useState('')
  const [monthlyXaf, setMonthlyXaf] = useState('')
  const [error, setError] = useState('')
  const hasData = useTransactionStore((s) => s.transactions.length) + useTransferStore((s) => s.transfers.length) + commitments.length > 0
  const [notice, setNotice] = useState('')

  const total = commitments.reduce((sum, c) => sum + c.monthlyXaf, 0)

  const handleAdd = (e) => {
    e.preventDefault()
    const result = addCommitment({ label, monthlyXaf })
    if (!result.ok) return setError(result.error)
    setError('')
    setLabel('')
    setMonthlyXaf('')
  }

  const handleDemo = () => {
    if (window.confirm(t('settings.confirmDemo'))) {
      loadDemoData(undefined, { overwrite: true })
      setNotice(t('settings.demoLoaded'))
    }
  }

  const handleClear = () => {
    if (window.confirm(t('settings.confirmDelete'))) {
      clearAllData()
      setNotice(t('settings.deleted'))
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t('nav.settings')}</h1>
        <p className="mt-2 text-muted">{t('settings.lead')}</p>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-indigo-100 p-6 md:p-7">
        <div>
          <h2 className="font-display text-xl font-semibold">{t('common.language')}</h2>
          <p className="mt-1 text-sm text-muted">{t('settings.languageText')}</p>
        </div>
        <LanguageSwitcher tone="light" />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-indigo-100 p-6 md:p-7">
        <div>
          <h2 className="font-display text-xl font-semibold">{t('theme.title')}</h2>
          <p className="mt-1 text-sm text-muted">{t('theme.text')}</p>
        </div>
        <div className="w-full sm:w-80"><ThemeChoice /></div>
      </section>

      <section className="rounded-lg border border-indigo-100 p-6 md:p-7">
        <h2 className="font-display text-xl font-semibold">{t('settings.commitments')}</h2>
        <p className="mt-1 text-sm text-muted">{t('settings.commitmentsText')}</p>

        <form onSubmit={handleAdd} noValidate className="mt-5 grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_12rem_auto]">
          <label className="text-sm font-semibold">
            {t('settings.name')}
            <input className={fieldClass} type="text" maxLength={60} placeholder={t('settings.namePlaceholder')} value={label} onChange={(e) => { setLabel(e.target.value); setError('') }} />
          </label>
          <label className="text-sm font-semibold">
            {t('settings.perMonth', { xaf: langInfo().xaf })}
            <input className={`${fieldClass} font-mono`} type="text" inputMode="numeric" placeholder="50000" value={monthlyXaf} onChange={(e) => { setMonthlyXaf(e.target.value); setError('') }} />
          </label>
          <button type="submit" className="rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-800">{t('settings.add')}</button>
        </form>
        {error && <p role="alert" className="mt-3 text-sm font-semibold text-fee">{tError(error)}</p>}

        {commitments.length > 0 && (
          <ul className="mt-6 border-t border-indigo-100">
            {commitments.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 border-b border-indigo-100 py-3">
                <span className="font-semibold">{c.label}</span>
                <span className="flex items-center gap-3">
                  <span className="font-mono">{formatXaf(c.monthlyXaf)}</span>
                  <button
                    type="button"
                    onClick={() => removeCommitment(c.id)}
                    aria-label={t('settings.remove', { name: c.label })}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-indigo-100 hover:text-fee"
                  >
                    <TrashIcon />
                  </button>
                </span>
              </li>
            ))}
            <li className="flex justify-between gap-4 pt-3 font-mono text-sm">
              <span className="font-sans text-muted">{t('settings.total')}</span>
              <span className="font-semibold">{formatXaf(total)} <span className="text-muted">≈ {formatEur(xafToEur(total))}</span></span>
            </li>
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-indigo-100 p-6 md:p-7">
        <h2 className="font-display text-xl font-semibold">{t('settings.data')}</h2>
        <p className="mt-1 max-w-prose text-sm text-muted">
          {t('settings.dataText')}
        </p>
        <p className="mt-2 max-w-prose text-sm font-semibold text-fee" data-testid="shared-device-warning">
          {t('settings.sharedDevice')}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={handleDemo} className="rounded-md border border-accent px-4 py-2.5 text-sm font-semibold text-accent hover:bg-indigo-100">
            {t('settings.loadDemo')}
          </button>
          <button type="button" onClick={handleClear} className="rounded-md border border-fee px-4 py-2.5 text-sm font-semibold text-fee hover:bg-fee/10">
            {t('settings.deleteAll')}
          </button>
        </div>
        {notice && <p role="status" className="mt-4 text-sm font-semibold text-received">{notice}</p>}
        <BackupPanel hasData={hasData} />
        <p className="mt-6 max-w-prose text-sm text-muted">{t('diagnostics.help')}</p>
        <DiagnosticReport className="mt-3" />
      </section>
    </div>
  )
}

export default Settings
