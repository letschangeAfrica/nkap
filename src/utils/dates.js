import { langInfo } from '../i18n'

/** Today's date as YYYY-MM-DD (local time), the format used by <input type="date">. */
export function todayISO(now = new Date()) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "2026-11-12" -> "2026-11" */
export const monthKey = (isoDate) => isoDate.slice(0, 7)

/** Current month as YYYY-MM */
export const currentMonthKey = (now = new Date()) => todayISO(now).slice(0, 7)

/** "2026-11-12" -> "12 Nov 2026" */
export function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(langInfo().dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })
}

/** "2026-11" -> "November 2026" */
export function formatMonth(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(langInfo().dateLocale, { month: 'long', year: 'numeric' })
}

/** "2026-11" -> "NOV" (EN) / "NOV." (FR) */
export function formatMonthShort(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(langInfo().dateLocale, { month: 'short' }).toUpperCase()
}

/** "2026-11" -> "November" / "novembre" */
export function formatMonthName(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(langInfo().dateLocale, { month: 'long' })
}
