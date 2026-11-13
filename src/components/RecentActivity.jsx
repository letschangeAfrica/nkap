import { Link } from 'react-router-dom'
import { formatEur } from '../utils/currency'
import { formatDate } from '../utils/dates'
import CostBadge from './CostBadge'
import { t } from '../i18n'

/** Latest transactions and transfers, merged and newest first. */
function RecentActivity({ items }) {
  return (
    <section className="rounded-lg border border-indigo-100">
      <div className="flex items-center justify-between border-b border-indigo-100 px-6 py-4">
        <h2 className="font-display text-xl font-semibold">{t('recent.title')}</h2>
        <Link to="/transactions" className="text-sm font-semibold text-indigo-600">{t('recent.seeAll')}</Link>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 border-t border-indigo-100 px-5 py-3.5 first:border-t-0 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-indigo-100 font-mono text-xs font-semibold" aria-hidden="true">
                {item.badge}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.title}</p>
                <p className="text-sm text-muted">{item.meta} · {formatDate(item.date)}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`whitespace-nowrap font-mono font-semibold ${item.amount > 0 ? 'text-received' : 'text-ink'}`}>
                {item.amount > 0 ? '+' : '−'}{formatEur(Math.abs(item.amount))}
              </span>
              {item.cost !== undefined && <CostBadge cost={item.cost} showLabel={false} />}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default RecentActivity
