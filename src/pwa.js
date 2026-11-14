/*
 * Installable app support: registers the service worker (production only) and
 * keeps the browser's install prompt so a button can show it later.
 */
let deferredPrompt = null
const listeners = new Set()
const notify = () => listeners.forEach((fn) => fn())

export const isStandalone = () =>
  typeof window !== 'undefined' &&
  ((typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true)

export const isIOS = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

export const canPromptInstall = () => deferredPrompt !== null

export function subscribeInstall(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Show the browser's install dialog. Resolves to 'accepted', 'dismissed' or 'unavailable'. */
export async function promptInstall() {
  if (!deferredPrompt) return 'unavailable'
  const prompt = deferredPrompt
  deferredPrompt = null
  notify()
  await prompt.prompt()
  const { outcome } = await prompt.userChoice
  return outcome
}

export function initPwa({ register = import.meta.env.PROD } = {}) {
  if (typeof window === 'undefined') return
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // keep it for our own button instead of the browser's mini bar
    deferredPrompt = e
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    notify()
  })
  if (register && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => { /* offline support is optional */ })
    })
  }
}
