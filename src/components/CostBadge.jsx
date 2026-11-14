import { costLevel } from '../utils/currency'
import { t, formatNumber } from '../i18n'

const styles = {
  light: { Low: 'border-received text-received', Medium: 'border-accent text-accent', High: 'border-fee text-fee' },
  dark: { Low: 'border-[#8FD3BE] text-[#8FD3BE]', Medium: 'border-mist text-mist', High: 'border-[#F4A79E] text-[#F4A79E]' },
}

/** Outlined pill showing a transfer's cost in % and its level (Low / Medium / High). */
function CostBadge({ cost, tone = 'light', showLabel = true }) {
  const level = costLevel(cost)
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold transition-colors ${styles[tone][level]}`}
    >
      {formatNumber(cost, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%{showLabel ? ` · ${t(`cost.${level}`)}` : ''}
    </span>
  )
}

export default CostBadge
