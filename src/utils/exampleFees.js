import { transferResult } from './currency'

/**
 * Illustrative fee models for the landing-page calculator only.
 * They are examples, not live prices: users record their real fees in the app.
 */
export const EXAMPLE_SERVICES = [
  { name: 'Wise', fixed: 0.3, percent: 0.9 },
  { name: 'Orange Money', fixed: 0, percent: 4.3 },
  { name: 'Western Union', fixed: 4.9, percent: 3.5 },
]

export const exampleFee = (amount, service) =>
  Math.round((service.fixed + (amount * service.percent) / 100) * 100) / 100

/** Result for every example service, plus which one leaves the most for the family. */
export function compareServices(amount) {
  const rows = EXAMPLE_SERVICES.map((s) => {
    const fee = Number.isFinite(amount) ? exampleFee(amount, s) : NaN
    return { ...s, fee, ...transferResult(amount, fee) }
  })
  const valid = rows.filter((r) => r.valid)
  const best = valid.length ? valid.reduce((a, b) => (b.received > a.received ? b : a)) : null
  return { rows, best }
}
