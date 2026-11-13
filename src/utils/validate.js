import { todayISO } from './dates'

export const MAX_TEXT = 60
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** A real YYYY-MM-DD date that is today or earlier (local time). */
export function validDate(d) {
  if (typeof d !== 'string' || !ISO_DATE.test(d)) return false
  const [y, m, day] = d.split('-').map(Number)
  const parsed = new Date(y, m - 1, day)
  const real = parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === day
  return real && d <= todayISO()
}

/** Trimmed text, capped at `max` characters ('' for non-strings). */
export const cleanText = (s, max = MAX_TEXT) => (typeof s === 'string' ? s.trim().slice(0, max) : '')

const isNum = (n) => typeof n === 'number' && Number.isFinite(n)
const isStr = (s) => typeof s === 'string'
const isISO = (d) => isStr(d) && ISO_DATE.test(d)

/* Shape checks used when data is loaded back from localStorage. */
export const isTransfer = (t) =>
  !!t && isStr(t.id) && isISO(t.date) && isStr(t.recipient) && isStr(t.service) &&
  [t.amount, t.fee, t.received, t.cost].every(isNum)

export const isTransaction = (t) =>
  !!t && isStr(t.id) && isISO(t.date) && (t.type === 'income' || t.type === 'expense') &&
  isStr(t.category) && isNum(t.amount) && (t.note === undefined || isStr(t.note))

export const isCommitment = (c) => !!c && isStr(c.id) && isStr(c.label) && isNum(c.monthlyXaf)

/**
 * Build a Zustand `persist` merge that keeps only well-formed items, so bad
 * saved data is dropped instead of crashing the app.
 */
export const sanitizedMerge = (key, isValid) => (persisted, current) => ({
  ...current,
  [key]: Array.isArray(persisted?.[key]) ? persisted[key].filter(isValid) : current[key],
})
