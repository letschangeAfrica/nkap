import { useAnimatedNumber } from '../hooks/useAnimatedNumber'

/** A KPI whose number counts up on first render. */
function KpiTile({ label, value, format, tone = 'text-ink', hint, hintTone = 'text-muted' }) {
  const shown = useAnimatedNumber(value, 600, 0)
  return (
    <div className="flex flex-col gap-1.5 p-5 md:p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className={`font-mono text-2xl font-semibold md:text-3xl ${tone}`}>{format(shown)}</p>
      {hint && <p className={`font-mono text-xs ${hintTone}`}>{hint}</p>}
    </div>
  )
}

export default KpiTile
