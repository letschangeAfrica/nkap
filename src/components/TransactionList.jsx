import { useMemo } from 'react'
import { useTransactionStore } from '../store/useTransactionStore'
import { formatEur } from '../utils/currency'
import { formatDate } from '../utils/dates'
import { sortByDateDesc } from '../utils/stats'
import TrashIcon from './TrashIcon'
import EmptyState from './EmptyState'
import { t } from '../i18n'

function TransactionList() {
  const transactions = useTransactionStore((state) => state.transactions)
  const removeTransaction = useTransactionStore((state) => state.removeTransaction)
  const sorted = useMemo(() => sortByDateDesc(transactions), [transactions])

  const handleDelete = (id) => {
    if (window.confirm(t('txList.confirmDelete'))) removeTransaction(id)
  }

  return (
    <section className="rounded-lg border border-indigo-100">
      <h2 className="border-b border-indigo-100 px-6 py-4 font-display text-xl font-semibold">{t('txList.title')}</h2>
      {sorted.length === 0 ? (
        <EmptyState title={t('txList.emptyTitle')}>{t('txList.emptyText')}</EmptyState>
      ) : (
        <ul>
          {sorted.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between gap-4 border-t border-indigo-100 px-5 py-3.5 first:border-t-0 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-semibold ${
                    tx.type === 'income' ? 'border-received/40 text-received' : 'border-indigo-100 text-indigo-950'
                  }`}
                  aria-hidden="true"
                >
                  {tx.type === 'income' ? t('txList.inBadge') : t(`categories.${tx.category}`).slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{tx.note || t(`categories.${tx.category}`)}</p>
                  <p className="text-sm text-muted">{t(`categories.${tx.category}`)} · {formatDate(tx.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`whitespace-nowrap font-mono font-semibold ${tx.type === 'income' ? 'text-received' : 'text-ink'}`}>
                  {tx.type === 'income' ? '+' : '−'}{formatEur(tx.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(tx.id)}
                  aria-label={t('txList.delete', { name: tx.note || t(`categories.${tx.category}`), date: formatDate(tx.date) })}
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
