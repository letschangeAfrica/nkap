import { useRef, useState } from 'react'
import { t } from '../i18n'
import { formatDate, todayISO } from '../utils/dates'
import {
  toCsv, makeBackup, parseBackup, restoreBackup, currentData, downloadFile,
  backupFileName, csvFileName, getLastBackup, setLastBackup, MAX_BACKUP_BYTES,
} from '../utils/backup'

// file.text() is missing in some older browsers: fall back to FileReader
const readText = (file) =>
  typeof file.text === 'function'
    ? file.text()
    : new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })

const daysSince = (iso) => Math.floor((new Date(`${todayISO()}T00:00:00`) - new Date(`${iso}T00:00:00`)) / 86400000)

/** Settings: export to CSV, save a backup file, restore one. Everything stays on the device. */
function BackupPanel({ hasData }) {
  const fileRef = useRef(null)
  const [last, setLast] = useState(getLastBackup)
  const [status, setStatus] = useState({ tone: '', text: '' })

  const exportCsv = () => {
    downloadFile(csvFileName(), toCsv(currentData()), 'text/csv;charset=utf-8')
    setStatus({ tone: 'ok', text: t('backup.csvDone') })
  }

  const saveBackup = () => {
    downloadFile(backupFileName(), JSON.stringify(makeBackup(currentData()), null, 2), 'application/json')
    setLastBackup()
    setLast(getLastBackup())
    setStatus({ tone: 'ok', text: t('backup.saved') })
  }

  const restore = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow picking the same file again
    if (!file) return
    if (file.size > MAX_BACKUP_BYTES) return setStatus({ tone: 'error', text: t('backup.errors.tooBig') })
    let text
    try {
      text = await readText(file)
    } catch {
      return setStatus({ tone: 'error', text: t('backup.errors.notBackup') })
    }
    const result = parseBackup(text)
    if (!result.ok) return setStatus({ tone: 'error', text: t(`backup.errors.${result.error}`) })
    const { transactions, transfers, commitments } = result.data
    const counts = { transactions: transactions.length, transfers: transfers.length, commitments: commitments.length }
    if (!window.confirm(t('backup.confirm', counts))) return
    restoreBackup(result.data)
    setStatus({ tone: 'ok', text: t('backup.restored', counts) + (result.skipped ? ` ${t('backup.skipped', { n: result.skipped })}` : '') })
  }

  const stale = hasData && (!last || daysSince(last) >= 30)

  return (
    <div className="mt-6 border-t border-indigo-100 pt-6">
      <h3 className="font-display text-lg font-semibold">{t('backup.title')}</h3>
      <p className="mt-1 max-w-prose text-sm text-muted">{t('backup.text')}</p>
      <p className={`mt-2 text-sm ${stale ? 'font-semibold text-fee' : 'text-muted'}`} data-testid="last-backup">
        {last ? t('backup.last', { date: formatDate(last) }) : t('backup.never')}
        {stale && ` ${t('backup.remind')}`}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={saveBackup} disabled={!hasData} className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50">
          {t('backup.save')}
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="rounded-md border border-accent px-4 py-2.5 text-sm font-semibold text-accent hover:bg-indigo-100">
          {t('backup.restore')}
        </button>
        <button type="button" onClick={exportCsv} disabled={!hasData} className="rounded-md border border-field px-4 py-2.5 text-sm font-semibold text-ink hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50">
          {t('backup.csv')}
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" onChange={restore} className="sr-only" aria-label={t('backup.restore')} tabIndex={-1} />
      </div>
      {status.text && (
        <p role={status.tone === 'error' ? 'alert' : 'status'} className={`mt-3 text-sm font-semibold ${status.tone === 'error' ? 'text-fee' : 'text-received'}`}>
          {status.text}
        </p>
      )}
    </div>
  )
}

export default BackupPanel
