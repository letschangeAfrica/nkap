import { formatNumber, langInfo } from '../i18n'

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

// Plain decimal amounts only: up to 999,999,999.99, at most 2 decimals.
// Rejects hex ("0x10"), binary, exponents ("1e300") and other Number() quirks.
const AMOUNT_RE = /^\d{1,9}(?:[.,]\d{1,2})?$/

/** Turn user input ("100", "100,50", " 12.3 ") into a number, or NaN. */
export function parseAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN
  if (typeof value !== 'string') return NaN
  const s = value.trim()
  return AMOUNT_RE.test(s) ? Number(s.replace(',', '.')) : NaN
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
export const formatEur = (n) => `${formatNumber(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
/** Whole euros, for headline figures: "1,250 €" */
export const formatEur0 = (n) => `${formatNumber(Math.round(n))} €`
/** "92,228 XAF" in English, "92 228 FCFA" in French */
export const formatXaf = (n) => `${formatNumber(Math.round(n))} ${langInfo().xaf}`
