import { monthKey } from './dates'

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
  const cost = sent > 0 ? Math.round((fees / sent) * 1000) / 10 : 0
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
    .map((g) => ({ service: g.service, count: g.count, cost: Math.round((g.fees / g.sent) * 1000) / 10 }))
    .sort((a, b) => a.cost - b.cost)
}
