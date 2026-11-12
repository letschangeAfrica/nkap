import { useMemo } from 'react'
import { useTransactionStore } from '../store/useTransactionStore'
import { formatEur } from '../utils/currency'
import { formatDate } from '../utils/dates'
import { sortByDateDesc } from '../utils/stats'
import TrashIcon from './TrashIcon'
import EmptyState from './EmptyState'

function TransactionList() {
  const transactions = useTransactionStore((state) => state.transactions)
  const removeTransaction = useTransactionStore((state) => state.removeTransaction)
  const sorted = useMemo(() => sortByDateDesc(transactions), [transactions])

  const handleDelete = (id) => {
    if (window.confirm('Delete this transaction?')) removeTransaction(id)
  }

  return (
    <section className="rounded-lg border border-indigo-100">
      <h2 className="border-b border-indigo-100 px-6 py-4 font-display text-xl font-semibold">History</h2>
      {sorted.length === 0 ? (
        <EmptyState title="No transactions yet">Add your income and expenses to see where your money goes each month.</EmptyState>
      ) : (
        <ul>
          {sorted.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 border-t border-indigo-100 px-5 py-3.5 first:border-t-0 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-semibold ${
                    t.type === 'income' ? 'border-received/40 text-received' : 'border-indigo-100 text-indigo-950'
                  }`}
                  aria-hidden="true"
                >
                  {t.type === 'income' ? 'IN' : t.category.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{t.note || t.category}</p>
                  <p className="text-sm text-muted">{t.category} · {formatDate(t.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`whitespace-nowrap font-mono font-semibold ${t.type === 'income' ? 'text-received' : 'text-ink'}`}>
                  {t.type === 'income' ? '+' : '−'}{formatEur(t.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  aria-label={`Delete ${t.note || t.category} on ${formatDate(t.date)}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-indigo-100 hover:text-fee"
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default TransactionList
