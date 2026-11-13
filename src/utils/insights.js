import { eurToXaf, formatXaf } from './currency'
import { transactionTotals, transferTotals } from './stats'

// keep "6,166 XAF" together on one line
const xaf = (n) => formatXaf(n).replace(' XAF', '\u00A0XAF')

const previousMonth = (key) => {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Up to three plain-language sentences about the month, most useful first.
 * Each is { id, text }.
 */
export function buildInsights({ transactions, transfers, month }) {
  const out = []
  const home = transferTotals(transfers, month)
  const money = transactionTotals(transactions, month)
  const before = transferTotals(transfers, previousMonth(month))

  if (home.fees > 0) {
    out.push({ id: 'fees', text: `This month, fees cost your family ${xaf(eurToXaf(home.fees))}.` })
  }
  if (home.sent > 0 && before.sent > 0 && home.cost !== before.cost) {
    const dir = home.cost < before.cost ? 'down' : 'up'
    out.push({ id: 'trend', text: `Your transfers cost ${home.cost}% this month, ${dir} from ${before.cost}% last month.` })
  }
  if (home.sent > 0 && money.income > 0) {
    out.push({ id: 'share', text: `You sent home ${Math.round((home.sent / money.income) * 100)}% of your income.` })
  }
  if (home.sent === 0 && transfers.length > 0) {
    out.push({ id: 'none', text: 'No transfer recorded yet this month.' })
  }
  return out.slice(0, 3)
}
