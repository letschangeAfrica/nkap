// The CFA franc (XAF) is pegged to the euro at a fixed rate.
export const EUR_TO_XAF = 655.957

// Cost thresholds (percentage of the amount sent) used for the cost badge.
export const COST_THRESHOLDS = { medium: 5, high: 10 }

/** Convert euros to CFA francs, rounded to the nearest franc. */
export function eurToXaf(eur) {
  if (!Number.isFinite(eur)) throw new TypeError('eurToXaf expects a finite number')
  return Math.round(eur * EUR_TO_XAF)
}

/** Convert CFA francs to euros, rounded to the cent. */
export function xafToEur(xaf) {
  if (!Number.isFinite(xaf)) throw new TypeError('xafToEur expects a finite number')
  return Math.round((xaf / EUR_TO_XAF) * 100) / 100
}

/** Turn user input ("100", "100,50", " 12.3 ") into a number, or NaN. */
export function parseAmount(value) {
  if (typeof value === 'number') return value
  if (typeof value !== 'string' || value.trim() === '') return NaN
  return Number(value.trim().replace(',', '.'))
}

/**
 * Result of a transfer where the fee is taken from the amount sent.
 * Returns { valid: true, net, received, cost } or { valid: false, error }.
 */
export function transferResult(amount, fee) {
  const a = parseAmount(amount)
  const f = parseAmount(fee)

  if (!Number.isFinite(a) || a <= 0) return { valid: false, error: 'Enter an amount greater than 0 €.' }
  if (!Number.isFinite(f) || f < 0) return { valid: false, error: 'Enter a fee of 0 € or more.' }
  if (f >= a) return { valid: false, error: 'The fee cannot be equal to or larger than the amount.' }

  const net = Math.round((a - f) * 100) / 100
  return {
    valid: true,
    net,
    received: eurToXaf(net),
    cost: Math.round((f / a) * 1000) / 10, // percentage, 1 decimal
  }
}

/** "Low" below 5 %, "Medium" from 5 % to below 10 %, "High" from 10 %. */
export function costLevel(costPercent) {
  if (costPercent >= COST_THRESHOLDS.high) return 'High'
  if (costPercent >= COST_THRESHOLDS.medium) return 'Medium'
  return 'Low'
}

/** Display helpers */
export const formatEur = (n) =>
  `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
export const formatXaf = (n) => `${Math.round(n).toLocaleString('en-US')} XAF`
