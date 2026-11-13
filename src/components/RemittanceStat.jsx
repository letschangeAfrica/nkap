import { useInView } from '../hooks/useInView'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'

/*
 * World Bank, Remittance Prices Worldwide, Issue 54 (Q3 2025): average total
 * cost of sending $200. Update these figures when a newer issue is published.
 */
export const RPW = {
  ssa: 8.46,
  global: 6.36,
  sdgTarget: 3,
  period: 'Q3 2025',
  url: 'https://remittanceprices.worldbank.org/sites/default/files/2026-04/RPW_main_report_and_annex_Q325.pdf',
}

const BARS = [
  { label: 'Sub-Saharan Africa', value: RPW.ssa, tone: 'bg-fee' },
  { label: 'World average', value: RPW.global, tone: 'bg-indigo-600' },
  { label: 'UN target for 2030', value: RPW.sdgTarget, tone: 'bg-received' },
]

/** The one big, sourced number on the landing page. */
function RemittanceStat() {
  const [ref, inView] = useInView()
  const shown = useAnimatedNumber(inView ? RPW.ssa : 0, 1200, 0)

  return (
    <section ref={ref} aria-labelledby="stat-heading" className="border-y border-indigo-100 bg-cloth">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 md:px-8 md:py-20 lg:grid-cols-2 lg:gap-24">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-600">The cost of sending home</p>
          <p id="stat-heading" className="mt-4 font-mono text-7xl font-semibold tracking-tight text-fee md:text-8xl">
            <span aria-hidden="true">{shown.toFixed(2)}%</span>
            <span className="sr-only">{RPW.ssa}%</span>
          </p>
          <p className="mt-4 max-w-md text-lg">
            is the average cost of sending $200 to sub-Saharan Africa, the most expensive region in the world to send money to.
          </p>
        </div>

        <div>
          <ul className="flex flex-col gap-5" aria-label="Average cost of sending $200">
            {BARS.map((b) => (
              <li key={b.label}>
                <div className="flex justify-between gap-4 text-sm">
                  <span>{b.label}</span>
                  <span className="font-mono font-semibold">{b.value.toFixed(2)}%</span>
                </div>
                <div className="mt-2 h-2.5 bg-indigo-100">
                  <div
                    className={`h-full origin-left transition-transform duration-1000 ease-out motion-reduce:transition-none ${b.tone}`}
                    style={{ width: `${(b.value / RPW.ssa) * 100}%`, transform: `scaleX(${inView ? 1 : 0})` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            Source:{' '}
            <a href={RPW.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 underline underline-offset-4">
              World Bank, Remittance Prices Worldwide, {RPW.period}
            </a>
            . The UN Sustainable Development Goals aim to bring this cost below 3% by 2030.
          </p>
        </div>
      </div>
    </section>
  )
}

export default RemittanceStat
