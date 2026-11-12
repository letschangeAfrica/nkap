import { useState } from 'react'
import { useCommitmentStore } from '../store/useCommitmentStore'
import { formatXaf, xafToEur, formatEur } from '../utils/currency'
import { loadDemoData, clearAllData } from '../utils/demoData'
import TrashIcon from '../components/TrashIcon'

const fieldClass =
  'mt-1.5 w-full rounded-md border border-[#B9C0DD] bg-white px-3.5 py-3 text-base text-ink focus:border-indigo-600'

function Settings() {
  const commitments = useCommitmentStore((s) => s.commitments)
  const addCommitment = useCommitmentStore((s) => s.addCommitment)
  const removeCommitment = useCommitmentStore((s) => s.removeCommitment)

  const [label, setLabel] = useState('')
  const [monthlyXaf, setMonthlyXaf] = useState('')
  const [error, setError] = useState('')
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
    if (window.confirm('Replace your data with demo data?')) {
      loadDemoData()
      setNotice('Demo data loaded. Open the dashboard to explore it.')
    }
  }

  const handleClear = () => {
    if (window.confirm('Delete all your transactions, transfers and commitments from this device? This cannot be undone.')) {
      clearAllData()
      setNotice('All your data has been deleted from this device.')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Settings</h1>
        <p className="mt-2 text-muted">Family commitments and your data.</p>
      </header>

      <section className="rounded-lg border border-indigo-100 p-6 md:p-7">
        <h2 className="font-display text-xl font-semibold">Family commitments</h2>
        <p className="mt-1 text-sm text-muted">Recurring support you plan to send every month, like school fees.</p>

        <form onSubmit={handleAdd} noValidate className="mt-5 grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_12rem_auto]">
          <label className="text-sm font-semibold">
            Name
            <input className={fieldClass} type="text" placeholder="School fees" value={label} onChange={(e) => { setLabel(e.target.value); setError('') }} />
          </label>
          <label className="text-sm font-semibold">
            Per month (XAF)
            <input className={`${fieldClass} font-mono`} type="text" inputMode="numeric" placeholder="50000" value={monthlyXaf} onChange={(e) => { setMonthlyXaf(e.target.value); setError('') }} />
          </label>
          <button type="submit" className="rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-800">Add</button>
        </form>
        {error && <p role="alert" className="mt-3 text-sm font-semibold text-fee">{error}</p>}

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
                    aria-label={`Remove ${c.label}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-indigo-100 hover:text-fee"
                  >
                    <TrashIcon />
                  </button>
                </span>
              </li>
            ))}
            <li className="flex justify-between gap-4 pt-3 font-mono text-sm">
              <span className="font-sans text-muted">Total per month</span>
              <span className="font-semibold">{formatXaf(total)} <span className="text-muted">≈ {formatEur(xafToEur(total))}</span></span>
            </li>
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-indigo-100 p-6 md:p-7">
        <h2 className="font-display text-xl font-semibold">Your data</h2>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Nkap has no account and no server. Everything you enter is stored only in this browser, on this device.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={handleDemo} className="rounded-md border border-indigo-600 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100">
            Load demo data
          </button>
          <button type="button" onClick={handleClear} className="rounded-md border border-fee px-4 py-2.5 text-sm font-semibold text-fee hover:bg-[#F8E7E5]">
            Delete all my data
          </button>
        </div>
        {notice && <p role="status" className="mt-4 text-sm font-semibold text-received">{notice}</p>}
      </section>
    </div>
  )
}

export default Settings
