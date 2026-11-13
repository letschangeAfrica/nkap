import { formatNumber, langInfo } from '../i18n'

/**
 * Ndop "running stitch" connector between EUR and XAF.
 * Changing `trigger` remounts the line, which replays the stitch animation.
 */
function StitchLine({ trigger, from = 'EUR', to, dark = false }) {
  const label = to ?? `× ${formatNumber(655.957, { maximumFractionDigits: 3 })} → ${langInfo().xaf}`
  return (
    <div className={`flex items-center gap-3 font-mono text-xs ${dark ? 'text-indigo-100/80' : 'text-muted'}`} aria-hidden="true">
      <span>{from}</span>
      <svg className="h-2 flex-1" viewBox="0 0 300 8" preserveAspectRatio="none">
        <line
          key={trigger}
          className="nk-stitch-run"
          x1="0"
          y1="4"
          x2="300"
          y2="4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="7 6"
          strokeLinecap="round"
          style={{ color: dark ? 'var(--color-cloth)' : 'var(--color-indigo-600)' }}
        />
      </svg>
      <span>{label}</span>
    </div>
  )
}

export default StitchLine
