import { todayISO } from './dates'
import { recordError } from './errorLog'

export const MAX_TEXT = 60
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** A YYYY-MM-DD string naming a day that exists (no 2025-02-30). */
export function isRealDate(d) {
  if (typeof d !== 'string' || !ISO_DATE.test(d)) return false
  const [y, m, day] = d.split('-').map(Number)
  const parsed = new Date(y, m - 1, day)
  return parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === day
}

/** A real YYYY-MM-DD date that is today or earlier (local time). */
export const validDate = (d) => isRealDate(d) && d <= todayISO()

/** Trimmed text, capped at `max` characters ('' for non-strings). */
export const cleanText = (s, max = MAX_TEXT) => (typeof s === 'string' ? s.trim().slice(0, max) : '')

const isNum = (n) => typeof n === 'number' && Number.isFinite(n)
const isPos = (n) => isNum(n) && n > 0
const isStr = (s) => typeof s === 'string'

/*
 * Checks used when data is loaded back from localStorage: shape and values the
 * app can compute with. Future dates are kept on purpose, so a device clock
 * that moves backwards never silently deletes records.
 */
export const isTransfer = (t) =>
  !!t && isStr(t.id) && isRealDate(t.date) && isStr(t.recipient) && isStr(t.service) &&
  isPos(t.amount) && isNum(t.fee) && t.fee >= 0 && t.fee < t.amount && isNum(t.received) && isNum(t.cost) &&
  (t.commitmentId == null || isStr(t.commitmentId))

export const isTransaction = (t) =>
  !!t && isStr(t.id) && isRealDate(t.date) && (t.type === 'income' || t.type === 'expense') &&
  isStr(t.category) && isPos(t.amount) && (t.note === undefined || isStr(t.note))

export const isCommitment = (c) => !!c && isStr(c.id) && isStr(c.label) && isPos(c.monthlyXaf)

/**
 * Reload a persisted store from localStorage right before it writes, so a save
 * never overwrites what another tab saved in the meantime. With localStorage
 * (synchronous) Zustand's rehydrate() completes before it returns.
 */
export function readLatest(api) {
  try {
    api.persist?.rehydrate()
  } catch {
    /* storage unavailable: keep the in-memory state */
  }
}

/**
 * Build a Zustand `persist` merge that keeps only well-formed items, so bad
 * saved data is dropped instead of crashing the app.
 */
export const sanitizedMerge = (key, isValid) => (persisted, current) => {
  if (!Array.isArray(persisted?.[key])) return { ...current }
  const kept = persisted[key].filter(isValid)
  const dropped = persisted[key].length - kept.length
  // Never silent: record how many were dropped (a count only, never the records themselves)
  if (dropped > 0) recordError(new Error(`${dropped} saved ${key} could not be read and were skipped`), 'rehydrate')
  return { ...current, [key]: kept }
}
