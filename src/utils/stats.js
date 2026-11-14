import { monthKey } from './dates'
import { costPercent } from './currency'

const round2 = (n) => Math.round(n * 100) / 100

/** Newest first (by date, then by creation time). */
export function sortByDateDesc(items) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt ?? 0) - (a.createdAt ?? 0))
}

/**
 * Totals for a list of transfers, optionally limited to one month (YYYY-MM).
 * cost = total fees as a percentage of the total amount sent.
 */
export function transferTotals(transfers, month) {
  const list = month ? transfers.filter((t) => monthKey(t.date) === month) : transfers
  const sent = round2(list.reduce((sum, t) => sum + t.amount, 0))
  const fees = round2(list.reduce((sum, t) => sum + t.fee, 0))
  const received = list.reduce((sum, t) => sum + t.received, 0)
  const cost = costPercent(fees, sent)
  return { count: list.length, sent, fees, received, cost }
}

/** Average cost per service, cheapest first: [{ service, count, cost }] */
export function costByService(transfers) {
  const groups = {}
  for (const t of transfers) {
    groups[t.service] ??= { service: t.service, count: 0, sent: 0, fees: 0 }
    groups[t.service].count += 1
    groups[t.service].sent += t.amount
    groups[t.service].fees += t.fee
  }
  return Object.values(groups)
    .map((g) => ({ service: g.service, count: g.count, cost: costPercent(g.fees, g.sent) }))
    .sort((a, b) => a.cost - b.cost)
}

/** Income, expenses and balance (EUR) for transactions, optionally for one month. */
export function transactionTotals(transactions, month) {
  const list = month ? transactions.filter((t) => monthKey(t.date) === month) : transactions
  const income = round2(list.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))
  const expenses = round2(list.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))
  return { income, expenses, balance: round2(income - expenses) }
}

/** The last `count` months, oldest first, as YYYY-MM keys. */
export function lastMonths(count, now = new Date()) {
  const keys = []
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
}

/** Per month: what I spent on my life (expenses) vs what I sent home (EUR). */
export function monthlySeries(transactions, transfers, count = 6, now = new Date()) {
  return lastMonths(count, now).map((key) => ({
    key,
    life: transactionTotals(transactions, key).expenses,
    home: transferTotals(transfers, key).sent,
  }))
}

/**
 * How much less the given month's transfers would have cost with the cheapest
 * service the user has used (EUR). 0 when there is nothing to compare.
 */
export function potentialSavings(transfers, month) {
  const services = costByService(transfers)
  if (services.length < 2) return { cheapest: services[0] ?? null, savings: 0 }
  const cheapest = services[0]
  const savings = transfers
    .filter((t) => monthKey(t.date) === month)
    .reduce((sum, t) => sum + Math.max(0, t.fee - (t.amount * cheapest.cost) / 100), 0)
  return { cheapest, savings: round2(savings) }
}

/**
 * This month's XAF received per family commitment. Transfers not linked to an
 * existing commitment count as "other" support.
 * Returns { rows: [{ id, label, planned, sent, remaining, over }], other, planned, sent }
 */
export function commitmentProgress(commitments, transfers, month) {
  const thisMonth = transfers.filter((t) => monthKey(t.date) === month)
  const ids = new Set(commitments.map((c) => c.id))
  const rows = commitments.map((c) => {
    const sent = thisMonth.filter((t) => t.commitmentId === c.id).reduce((sum, t) => sum + t.received, 0)
    return { id: c.id, label: c.label, planned: c.monthlyXaf, sent, remaining: Math.max(0, c.monthlyXaf - sent), over: Math.max(0, sent - c.monthlyXaf) }
  })
  const other = thisMonth.filter((t) => !ids.has(t.commitmentId)).reduce((sum, t) => sum + t.received, 0)
  return {
    rows,
    other,
    planned: rows.reduce((sum, r) => sum + r.planned, 0),
    sent: rows.reduce((sum, r) => sum + r.sent, 0),
  }
}
