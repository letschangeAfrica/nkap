/**
 * A small error log kept on this device only. Nothing is sent anywhere: the
 * user can choose to copy a diagnostic report and share it (Settings, or the
 * error screen). Entries hold the error type, a sanitized message, where it
 * happened, the page path and the app version. Never amounts, names, notes or
 * any saved data.
 */
export const ERROR_LOG_KEY = 'nkap-error-log'
export const MAX_ENTRIES = 20
const MAX_LEN = 300
// Control characters plus the Unicode line/paragraph separators (U+2028, U+2029)
const CONTROL_CHARS = new RegExp(`[\x00-\x1f\x7f${String.fromCharCode(0x2028, 0x2029)}]`, 'g')

/* global __APP_VERSION__ */
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'

/**
 * Log-injection-safe, privacy-safe text: anything in quotes is blanked (some
 * browsers quote the input in JSON errors, which could be saved data), control
 * characters and line separators become spaces, and the length is capped.
 */
export function sanitize(value) {
  return String(value ?? '')
    .replace(/"[^"]*"|'[^']*'|`[^`]*`/g, '"…"')
    .replace(CONTROL_CHARS, ' ')
    .slice(0, MAX_LEN)
}

export function readErrorLog() {
  try {
    const log = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || '[]')
    return Array.isArray(log) ? log : []
  } catch {
    return []
  }
}

/** Record an error. Never throws: logging must not break the app. */
export function recordError(error, where = 'unknown') {
  try {
    const entry = {
      at: new Date().toISOString(),
      where: sanitize(where),
      name: sanitize(error?.name || 'Error'),
      message: sanitize(error?.message ?? error),
      path: typeof location === 'undefined' ? '' : location.pathname, // routes only: the app never puts data in the URL
      version: APP_VERSION,
    }
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify([...readErrorLog(), entry].slice(-MAX_ENTRIES)))
  } catch {
    /* storage blocked or full */
  }
}

export function clearErrorLog() {
  try {
    localStorage.removeItem(ERROR_LOG_KEY)
  } catch {
    /* storage blocked */
  }
}

/** The text a user can paste into a bug report. */
export function diagnosticReport() {
  return JSON.stringify({ app: 'nkap', version: APP_VERSION, generatedAt: new Date().toISOString(), errors: readErrorLog() }, null, 2)
}

/** Catch errors React doesn't see (event handlers, timers, promises). Call once at start-up. */
export function installGlobalErrorLogging() {
  if (typeof window === 'undefined') return () => {}
  const onError = (e) => recordError(e.error ?? e.message, 'window')
  const onRejection = (e) => recordError(e.reason, 'promise')
  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)
  return () => {
    window.removeEventListener('error', onError)
    window.removeEventListener('unhandledrejection', onRejection)
  }
}

/** Options for createRoot: record React's errors, and keep logging them to the console as React does by default. */
export const reactRootErrorOptions = {
  onCaughtError: (error) => { recordError(error, 'boundary'); console.error(error) },
  onUncaughtError: (error) => { recordError(error, 'uncaught'); console.error(error) },
  onRecoverableError: (error) => recordError(error, 'recoverable'),
}
