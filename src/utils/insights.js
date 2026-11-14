import { eurToXaf, formatXaf } from './currency'
import { t, formatNumber } from '../i18n'
import { transactionTotals, transferTotals, commitmentProgress } from './stats'

// keep "6,166 XAF" together on one line
const xaf = (n) => formatXaf(n).replace(/ (?=\S+$)/, '\u00A0')

const previousMonth = (key) => {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Up to three plain-language sentences about the month, most useful first.
 * Each is { id, text }.
 */
export function buildInsights({ transactions, transfers, month, commitments = [], today = new Date() }) {
  const out = []
  const home = transferTotals(transfers, month)
  const money = transactionTotals(transactions, month)
  const before = transferTotals(transfers, previousMonth(month))

  if (home.fees > 0) {
    out.push({ id: 'fees', text: t('insights.fees', { xaf: xaf(eurToXaf(home.fees)) }) })
  }
  // Family plan: say clearly when a commitment went over, or is still open late in the month
  const plan = commitmentProgress(commitments, transfers, month)
  const overRow = plan.rows.find((r) => r.over > 0)
  if (overRow) out.push({ id: 'over', text: t('insights.over', { xaf: xaf(overRow.over), label: overRow.label }) })
  const lateInMonth = month === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}` && today.getDate() >= 20
  const openRows = plan.rows.filter((r) => r.remaining > 0)
  if (lateInMonth && openRows.length > 0) {
    out.push({ id: 'behind', text: t('insights.behind', { xaf: xaf(openRows.reduce((sum, r) => sum + r.remaining, 0)), count: openRows.length }) })
  }
  if (home.sent > 0 && before.sent > 0 && home.cost !== before.cost) {
    const key = home.cost < before.cost ? 'insights.trendDown' : 'insights.trendUp'
    out.push({ id: 'trend', text: t(key, { now: formatNumber(home.cost), before: formatNumber(before.cost) }) })
  }
  if (home.sent > 0 && money.income > 0) {
    out.push({ id: 'share', text: t('insights.share', { pct: Math.round((home.sent / money.income) * 100) }) })
  }
  if (home.sent === 0 && transfers.length > 0) {
    out.push({ id: 'none', text: t('insights.none') })
  }
  return out.slice(0, 3)
}
