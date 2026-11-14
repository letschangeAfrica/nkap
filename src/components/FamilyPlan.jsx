import { Link } from 'react-router-dom'
import { formatXaf } from '../utils/currency'
import Logo from './Logo'
import { t } from '../i18n'

/** Stitched progress line; turns warm red when a commitment goes over plan. */
function Stitch({ pct, over, label }) {
  return (
    <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-2.5 w-full" role="img" aria-label={label}>
      <line x1="0" y1="5" x2="100" y2="5" stroke="#4B5A9E" strokeWidth="2" strokeDasharray="2 1.6" />
      <line x1="0" y1="5" x2={Math.min(100, pct)} y2="5" stroke={over ? '#F4A79E' : 'var(--color-cloth)'} strokeWidth="4" />
    </svg>
  )
}

/**
 * This month's family plan: one line per commitment (sent vs planned, with
 * what is left or how much went over), plus support sent outside the plan.
 */
function FamilyPlan({ progress, monthName }) {
  if (progress.rows.length === 0) {
    return (
      <section className="rounded-lg bg-indigo-950 p-6 text-cloth">
        <h2 className="font-display text-lg font-semibold">{t('familyPlan.title')}</h2>
        <p className="mt-2 text-sm text-mist/80">{t('familyPlan.empty')}</p>
        <Link to="/settings" className="mt-4 inline-block text-sm font-semibold text-cloth underline underline-offset-4">{t('familyPlan.add')}</Link>
      </section>
    )
  }

  const totalPct = Math.round((progress.sent / progress.planned) * 100)

  return (
    <section className="relative flex flex-col gap-4 overflow-hidden rounded-lg bg-indigo-950 p-6 text-cloth">
      <Logo className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 text-cloth/[0.07]" />
      <h2 className="font-display text-lg font-semibold">{t('familyPlan.title')} · {monthName}</h2>

      <ul className="flex flex-col gap-4">
        {progress.rows.map((r) => {
          const pct = Math.round((r.sent / r.planned) * 100)
          return (
            <li key={r.id} className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className="min-w-0 break-words text-sm font-semibold">{r.label}</span>
                <span className="whitespace-nowrap font-mono text-xs text-mist/80">{formatXaf(r.sent)} / {formatXaf(r.planned)}</span>
              </div>
              <Stitch pct={pct} over={r.over > 0} label={t('familyPlan.progress', { pct })} />
              <p className={`text-xs ${r.over > 0 ? 'font-semibold text-[#F4A79E]' : 'text-mist/80'}`}>
                {r.over > 0
                  ? t('familyPlan.over', { xaf: formatXaf(r.over) })
                  : r.remaining > 0
                    ? t('familyPlan.toSend', { xaf: formatXaf(r.remaining) })
                    : `✓ ${t('familyPlan.rowDone')}`}
              </p>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col gap-1 border-t border-white/10 pt-3 font-mono text-sm">
        <div className="flex justify-between gap-3">
          <span className="font-sans text-mist/80">{t('familyPlan.total')}</span>
          <span>{formatXaf(progress.sent)} / {formatXaf(progress.planned)} · {totalPct}%</span>
        </div>
        {progress.other > 0 && (
          <div className="flex justify-between gap-3 text-xs text-mist/80">
            <span className="font-sans">{t('familyPlan.other')}</span>
            <span>{formatXaf(progress.other)}</span>
          </div>
        )}
      </div>
    </section>
  )
}

export default FamilyPlan
