import { Link } from 'react-router-dom'
import { formatXaf } from '../utils/currency'
import Logo from './Logo'
import { t } from '../i18n'

/** Stitched progress bar: XAF received this month vs planned family commitments. */
function FamilyPlan({ planned, received, monthName }) {
  if (planned === 0) {
    return (
      <section className="rounded-lg bg-indigo-950 p-6 text-cloth">
        <h2 className="font-display text-lg font-semibold">{t('familyPlan.title')}</h2>
        <p className="mt-2 text-sm text-indigo-100/80">{t('familyPlan.empty')}</p>
        <Link to="/settings" className="mt-4 inline-block text-sm font-semibold text-cloth underline underline-offset-4">{t('familyPlan.add')}</Link>
      </section>
    )
  }
  const pct = Math.min(100, Math.round((received / planned) * 100))
  const remaining = Math.max(0, planned - received)

  return (
    <section className="relative flex flex-col gap-3 overflow-hidden rounded-lg bg-indigo-950 p-6 text-cloth">
      <Logo className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 text-cloth/[0.07]" />
      <h2 className="font-display text-lg font-semibold">{t('familyPlan.title')} · {monthName}</h2>
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-2.5 w-full" role="img" aria-label={t('familyPlan.progress', { pct })}>
        <line x1="0" y1="5" x2="100" y2="5" stroke="#4B5A9E" strokeWidth="2" strokeDasharray="2 1.6" />
        <line x1="0" y1="5" x2={pct} y2="5" stroke="var(--color-cloth)" strokeWidth="4" />
      </svg>
      <div className="flex justify-between gap-3 font-mono text-sm">
        <span>{formatXaf(received)} / {formatXaf(planned)}</span>
        <span className="text-indigo-100/80">{pct}%</span>
      </div>
      <p className="text-sm text-indigo-100/80">{remaining > 0 ? t('familyPlan.remaining', { xaf: formatXaf(remaining) }) : t('familyPlan.done')}</p>
    </section>
  )
}

export default FamilyPlan
