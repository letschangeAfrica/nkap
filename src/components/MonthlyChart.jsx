import { formatEur } from '../utils/currency'

const hatch = 'repeating-linear-gradient(135deg, var(--color-indigo-600) 0 1.5px, #fff 1.5px 5px)'

/** Grouped bars: my life (solid indigo) vs sent home (Ndop hatch), last 6 months. */
function MonthlyChart({ series }) {
  const max = Math.max(...series.flatMap((m) => [m.life, m.home]), 1)
  const label = (key) => new Date(`${key}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
  const summary = series.map((m) => `${label(m.key)}: my life ${formatEur(m.life)}, sent home ${formatEur(m.home)}`).join('; ')

  return (
    <section className="rounded-lg border border-indigo-100 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">My life vs. family support</h2>
        <div className="flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-2"><span className="h-3 w-3 bg-indigo-950" />My life</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 border border-indigo-600" style={{ background: hatch }} />Sent home</span>
        </div>
      </div>

      <div role="img" aria-label={`Last six months. ${summary}`} className="mt-6 grid h-56 grid-cols-6 items-end gap-3 border-b border-ink md:gap-5">
        {series.map((m, i) => (
          <div key={m.key} className="flex h-full items-end justify-center gap-1 md:gap-1.5">
            <div
              className="nk-grow w-3.5 bg-indigo-950 md:w-6"
              style={{ height: `${(m.life / max) * 100}%`, animationDelay: `${200 + i * 40}ms` }}
              title={`My life: ${formatEur(m.life)}`}
            />
            <div
              className="nk-grow w-3.5 border border-indigo-600 md:w-6"
              style={{ height: `${(m.home / max) * 100}%`, background: hatch, animationDelay: `${200 + i * 40}ms` }}
              title={`Sent home: ${formatEur(m.home)}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-6 gap-3 text-center font-mono text-xs text-muted md:gap-5" aria-hidden="true">
        {series.map((m) => <span key={m.key}>{label(m.key)}</span>)}
      </div>
    </section>
  )
}

export default MonthlyChart
