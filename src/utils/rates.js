import { EUR_TO_XAF } from './currency'

export const RATES_URL = 'https://api.frankfurter.dev/v1/latest'
export const CACHE_KEY = 'nkap-rates'

/** Currencies offered in the converter. XAF is not published by the ECB: it uses the fixed peg. */
export const CURRENCIES = [
  { code: 'EUR', name: 'Euro', decimals: 2 },
  { code: 'XAF', name: 'CFA franc (BEAC)', decimals: 0 },
  { code: 'USD', name: 'US dollar', decimals: 2 },
  { code: 'GBP', name: 'British pound', decimals: 2 },
  { code: 'CAD', name: 'Canadian dollar', decimals: 2 },
  { code: 'CHF', name: 'Swiss franc', decimals: 2 },
  { code: 'CNY', name: 'Chinese yuan', decimals: 2 },
]
export const LIVE_CODES = CURRENCIES.map((c) => c.code).filter((c) => c !== 'EUR' && c !== 'XAF')

/** Rates that never need the network: 1 EUR = 1 EUR = 655.957 XAF. */
export const FIXED_RATES = { EUR: 1, XAF: EUR_TO_XAF }

/** Is a conversion possible with the rates we have? */
export const hasRate = (code, liveRates = {}) => code in FIXED_RATES || Number.isFinite(liveRates[code])

/**
 * Convert `amount` from one currency to another. All rates are "per 1 EUR",
 * so every conversion goes through the euro. Returns null when a rate is missing.
 */
export function convert(amount, from, to, liveRates = {}) {
  if (!Number.isFinite(amount)) return null
  const rates = { ...liveRates, ...FIXED_RATES }
  if (!hasRate(from, rates) || !hasRate(to, rates)) return null
  return (amount / rates[from]) * rates[to]
}

/** Price of 1 unit of `from` in `to`, or null. */
export const unitRate = (from, to, liveRates) => convert(1, from, to, liveRates)

export function formatMoney(n, code) {
  const decimals = CURRENCIES.find((c) => c.code === code)?.decimals ?? 2
  const text = n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return code === 'EUR' ? `${text} €` : `${text} ${code}`
}

/** Show small rates with enough significant digits (1 XAF = 0.001524 EUR). */
export function formatRate(n) {
  if (n >= 100) return n.toLocaleString('en-US', { maximumFractionDigits: 3 })
  if (n >= 1) return n.toLocaleString('en-US', { maximumFractionDigits: 4 })
  return n.toPrecision(4)
}

/**
 * Fetch today's ECB rates (per 1 EUR) from Frankfurter. Throws on network
 * errors, timeouts, bad status codes and unexpected responses.
 */
export async function fetchEurRates({ fetchImpl = globalThis.fetch, timeoutMs = 8000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetchImpl(`${RATES_URL}?base=EUR&symbols=${LIVE_CODES.join(',')}`, { signal: controller.signal })
    if (!res.ok) throw new Error(`Rate service answered ${res.status}`)
    const data = await res.json()
    const rates = {}
    for (const code of LIVE_CODES) {
      const value = data?.rates?.[code]
      if (typeof value === 'number' && value > 0) rates[code] = value
    }
    if (Object.keys(rates).length === 0 || typeof data.date !== 'string') throw new Error('Unexpected response from the rate service')
    return { date: data.date, rates }
  } finally {
    clearTimeout(timer)
  }
}

export function readCachedRates() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    return cached && typeof cached.date === 'string' && cached.rates ? cached : null
  } catch {
    return null
  }
}

export function writeCachedRates(value) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value))
  } catch {
    /* storage full or blocked: the live rates still work for this visit */
  }
}
