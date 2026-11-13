import { useMemo } from 'react'
import { useTransferStore } from '../store/useTransferStore'
import { formatEur, formatXaf } from '../utils/currency'
import { currentMonthKey, formatMonth, formatMonthName } from '../utils/dates'
import { transferTotals, costByService } from '../utils/stats'
import CostBadge from './CostBadge'
import { t } from '../i18n'

/** This month's totals plus average cost per service. */
function TransferSummary() {
  const transfers = useTransferStore((state) => state.transfers)
  const month = currentMonthKey()
  const totals = useMemo(() => transferTotals(transfers, month), [transfers, month])
  const services = useMemo(() => costByService(transfers), [transfers])
  const maxCost = Math.max(...services.map((s) => s.cost), 1)

  return (
    <>
      <section aria-label={t('common.totalsFor', { month: formatMonth(month) })} className="grid grid-cols-1 divide-y divide-indigo-100 rounded-lg border border-indigo-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex items-baseline justify-between gap-3 p-4 sm:block md:p-5">
          <p className="text-sm text-muted">{t('summary.sentIn', { month: formatMonthName(month) })}</p>
          <p className="font-mono text-lg sm:mt-1.5 font-semibold md:text-2xl">{formatEur(totals.sent)}</p>
        </div>
        <div className="flex items-baseline justify-between gap-3 p-4 sm:block md:p-5">
          <p className="text-sm text-muted">{t('summary.received')}</p>
          <p className="font-mono text-lg sm:mt-1.5 font-semibold text-received md:text-2xl">{formatXaf(totals.received)}</p>
        </div>
        <div className="flex items-baseline justify-between gap-3 p-4 sm:block md:p-5">
          <p className="text-sm text-muted">{t('summary.fees')}</p>
          <p className="font-mono text-lg sm:mt-1.5 font-semibold text-fee md:text-2xl">{formatEur(totals.fees)}</p>
        </div>
      </section>

      {services.length > 0 && (
        <section className="rounded-lg border border-indigo-100 p-6">
          <h2 className="font-display text-xl font-semibold">{t('summary.byService')}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {services.map((s) => (
              <li key={s.service} className="grid grid-cols-[8rem_1fr_auto] items-center gap-4 text-sm">
                <span>{s.service} <span className="text-muted">({s.count})</span></span>
                <div className="h-2.5 bg-indigo-100" aria-hidden="true">
                  <div
                    className={`h-full ${s.cost >= 10 ? 'bg-fee' : s.cost >= 5 ? 'bg-indigo-600' : 'bg-received'}`}
                    style={{ width: `${Math.max(4, (s.cost / maxCost) * 100)}%` }}
                  />
                </div>
                <CostBadge cost={s.cost} showLabel={false} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

export default TransferSummary
