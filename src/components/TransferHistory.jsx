import { useMemo } from 'react'
import { useTransferStore } from '../store/useTransferStore'
import { formatEur } from '../utils/currency'
import { formatDate } from '../utils/dates'
import { sortByDateDesc } from '../utils/stats'
import CostBadge from './CostBadge'

function DeleteButton({ transfer, onDelete }) {
  return (
    <button
      type="button"
      onClick={() => onDelete(transfer.id)}
      aria-label={`Delete transfer to ${transfer.recipient} on ${formatDate(transfer.date)}`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-indigo-100 hover:text-fee"
    >
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function TransferHistory() {
  const transfers = useTransferStore((state) => state.transfers)
  const removeTransfer = useTransferStore((state) => state.removeTransfer)
  const sorted = useMemo(() => sortByDateDesc(transfers), [transfers])

  const handleDelete = (id) => {
    if (window.confirm('Delete this transfer?')) removeTransfer(id)
  }

  return (
    <section className="rounded-lg border border-indigo-100">
      <h2 className="border-b border-indigo-100 px-6 py-4 font-display text-xl font-semibold">Transfer history</h2>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <svg viewBox="0 0 48 48" className="h-12 w-12 text-indigo-100" aria-hidden="true">
            <path d="M24 3 L45 24 L24 45 L3 24 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
            <circle cx="24" cy="24" r="5" fill="currentColor" />
          </svg>
          <p className="font-semibold">No transfers yet</p>
          <p className="max-w-xs text-sm text-muted">Record your first transfer to see what really arrived and what it cost you.</p>
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted">
                  <th className="py-3 pl-6 pr-2 font-semibold">Date</th>
                  <th className="px-2 py-3 font-semibold">Recipient</th>
                  <th className="hidden px-2 py-3 font-semibold lg:table-cell">Service</th>
                  <th className="px-2 py-3 text-right font-semibold">Sent</th>
                  <th className="px-2 py-3 text-right font-semibold">Received</th>
                  <th className="px-2 py-3 text-right font-semibold">Cost</th>
                  <th className="py-3 pr-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => (
                  <tr key={t.id} className="border-t border-indigo-100 transition-colors hover:bg-[#F5F6FB]">
                    <td className="whitespace-nowrap py-4 pl-6 pr-2 font-mono">{formatDate(t.date)}</td>
                    <td className="px-2 py-4"><span className="font-semibold">{t.recipient}</span><span className="block text-xs text-muted lg:hidden">{t.service}</span></td>
                    <td className="hidden px-2 py-4 lg:table-cell">{t.service}</td>
                    <td className="whitespace-nowrap px-2 py-4 text-right font-mono">{formatEur(t.amount)}</td>
                    <td className="whitespace-nowrap px-2 py-4 text-right font-mono font-semibold text-received">{t.received.toLocaleString('en-US')}</td>
                    <td className="px-2 py-4 text-right"><CostBadge cost={t.cost} /></td>
                    <td className="py-4 pr-4 text-right"><DeleteButton transfer={t} onDelete={handleDelete} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked rows */}
          <ul className="md:hidden">
            {sorted.map((t) => (
              <li key={t.id} className="flex flex-col gap-1.5 border-t border-indigo-100 px-5 py-4 first:border-t-0">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">{t.recipient}</span>
                  <span className="font-mono font-semibold text-received">{t.received.toLocaleString('en-US')} XAF</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-muted">
                  <span>{t.service} · {formatDate(t.date)} · {formatEur(t.amount)}</span>
                  <CostBadge cost={t.cost} />
                </div>
                <div className="-mr-2 flex justify-end"><DeleteButton transfer={t} onDelete={handleDelete} /></div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default TransferHistory
