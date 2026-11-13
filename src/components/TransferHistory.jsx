import { useMemo } from 'react'
import { useTransferStore } from '../store/useTransferStore'
import { formatEur, formatXaf } from '../utils/currency'
import { formatDate } from '../utils/dates'
import { sortByDateDesc } from '../utils/stats'
import CostBadge from './CostBadge'
import TrashIcon from './TrashIcon'
import EmptyState from './EmptyState'
import { t, formatNumber } from '../i18n'

function DeleteButton({ transfer, onDelete }) {
  return (
    <button
      type="button"
      onClick={() => onDelete(transfer.id)}
      aria-label={t('history.deleteTransfer', { recipient: transfer.recipient, date: formatDate(transfer.date) })}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-indigo-100 hover:text-fee"
    >
      <TrashIcon />
    </button>
  )
}

function TransferHistory() {
  const transfers = useTransferStore((state) => state.transfers)
  const removeTransfer = useTransferStore((state) => state.removeTransfer)
  const sorted = useMemo(() => sortByDateDesc(transfers), [transfers])

  const handleDelete = (id) => {
    if (window.confirm(t('history.confirmDelete'))) removeTransfer(id)
  }

  return (
    <section className="rounded-lg border border-indigo-100">
      <h2 className="border-b border-indigo-100 px-6 py-4 font-display text-xl font-semibold">{t('history.title')}</h2>

      {sorted.length === 0 ? (
        <EmptyState title={t('history.emptyTitle')}>
          {t('history.emptyText')}
        </EmptyState>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted">
                  <th className="py-3 pl-6 pr-2 font-semibold">{t('common.date')}</th>
                  <th className="px-2 py-3 font-semibold">{t('transferForm.recipient')}</th>
                  <th className="hidden px-2 py-3 font-semibold lg:table-cell">{t('transferForm.service')}</th>
                  <th className="px-2 py-3 text-right font-semibold">{t('history.sent')}</th>
                  <th className="px-2 py-3 text-right font-semibold">{t('summary.received')}</th>
                  <th className="px-2 py-3 text-right font-semibold">{t('history.cost')}</th>
                  <th className="py-3 pr-4"><span className="sr-only">{t('history.actions')}</span></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((tx) => (
                  <tr key={tx.id} className="border-t border-indigo-100 transition-colors hover:bg-[#F5F6FB]">
                    <td className="whitespace-nowrap py-4 pl-6 pr-2 font-mono">{formatDate(tx.date)}</td>
                    <td className="px-2 py-4"><span className="font-semibold">{tx.recipient}</span><span className="block text-xs text-muted lg:hidden">{tx.service}</span></td>
                    <td className="hidden px-2 py-4 lg:table-cell">{tx.service}</td>
                    <td className="whitespace-nowrap px-2 py-4 text-right font-mono">{formatEur(tx.amount)}</td>
                    <td className="whitespace-nowrap px-2 py-4 text-right font-mono font-semibold text-received">{formatNumber(tx.received)}</td>
                    <td className="px-2 py-4 text-right"><CostBadge cost={tx.cost} /></td>
                    <td className="py-4 pr-4 text-right"><DeleteButton transfer={tx} onDelete={handleDelete} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked rows */}
          <ul className="md:hidden">
            {sorted.map((tx) => (
              <li key={tx.id} className="flex flex-col gap-1.5 border-t border-indigo-100 px-5 py-4 first:border-t-0">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">{tx.recipient}</span>
                  <span className="font-mono font-semibold text-received">{formatXaf(tx.received)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm text-muted">
                  <span>{tx.service} · {formatDate(tx.date)} · {formatEur(tx.amount)}</span>
                  <CostBadge cost={tx.cost} />
                </div>
                <div className="-mr-2 flex justify-end"><DeleteButton transfer={tx} onDelete={handleDelete} /></div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default TransferHistory
