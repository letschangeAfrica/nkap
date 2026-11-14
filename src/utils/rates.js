import { formatNumber, langInfo, t } from '../i18n'
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
  const text = formatNumber(n, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  if (code === 'EUR') return `${text} €`
  return `${text} ${code === 'XAF' ? langInfo().xaf : code}`
}

/** Show small rates with enough significant digits (1 XAF = 0.001524 EUR). */
export function formatRate(n) {
  if (n >= 100) return formatNumber(n, { maximumFractionDigits: 3 })
  if (n >= 1) return formatNumber(n, { maximumFractionDigits: 4 })
  return formatNumber(Number(n.toPrecision(4)), { maximumSignificantDigits: 4 })
}

/** Keep only the currencies we offer, with finite positive rates. */
function sanitizeRates(raw) {
  const rates = {}
  for (const code of LIVE_CODES) {
    const value = raw?.[code]
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) rates[code] = value
  }
  return rates
}

/**
 * Fetch today's ECB rates (per 1 EUR) from Frankfurter. Throws on network
 * errors, timeouts, bad status codes and unexpected responses.
 */
export async function fetchEurRates({ fetchImpl = globalThis.fetch, timeoutMs = 8000, signal } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  // let the caller cancel too (e.g. a newer request replaces this one)
  const cancel = () => controller.abort()
  if (signal?.aborted) controller.abort()
  signal?.addEventListener('abort', cancel)
  try {
    const res = await fetchImpl(`${RATES_URL}?base=EUR&symbols=${LIVE_CODES.join(',')}`, { signal: controller.signal })
    if (!res.ok) throw new Error(`Rate service answered ${res.status}`)
    const data = await res.json()
    const rates = sanitizeRates(data?.rates)
    if (Object.keys(rates).length === 0 || typeof data.date !== 'string') throw new Error('Unexpected response from the rate service')
    return { date: data.date, rates }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', cancel)
  }
}

export function readCachedRates() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    if (!cached || typeof cached.date !== 'string') return null
    const rates = sanitizeRates(cached.rates)
    return Object.keys(rates).length ? { date: cached.date, rates } : null
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

/** Currency name in the current language. */
export const currencyName = (code) => t(`currencies.${code}`)
