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

/*
 * Browsers don't tell a web page whether it is installed. We remember the
 * browser's own "appinstalled" event, so the website stops showing install steps.
 * If the user uninstalls, the browser offers installation again and the flag is cleared.
 */
export const INSTALLED_KEY = 'nkap-installed'
export function wasInstalled() {
  try {
    return localStorage.getItem(INSTALLED_KEY) === '1'
  } catch {
    return false
  }
}
function rememberInstalled(installed) {
  try {
    if (installed) localStorage.setItem(INSTALLED_KEY, '1')
    else localStorage.removeItem(INSTALLED_KEY)
  } catch {
    /* storage blocked: the panel just shows the generic steps */
  }
}

// True once a newer version has taken over while this page was open
let updateReady = false
export const isUpdateReady = () => updateReady
export const UPDATE_CHECK_MS = 60 * 60 * 1000

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
    rememberInstalled(false) // offered again: it is not installed any more
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    rememberInstalled(true)
    notify()
  })
  if ('serviceWorker' in navigator) watchForUpdates(navigator.serviceWorker)
  if (register && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // An app left open for days still hears about new versions
          setInterval(() => {
            if (document.visibilityState === 'visible') reg.update().catch(() => {})
          }, UPDATE_CHECK_MS)
        })
        .catch(() => { /* offline support is optional */ })
    })
  }
}

/**
 * When a new service worker takes control of a page that already had one, the
 * code running in this tab is the old version: offer a reload.
 * (The very first install also changes the controller, but there was no old version then.)
 */
export function watchForUpdates(container) {
  let hadController = !!container.controller
  container.addEventListener('controllerchange', () => {
    if (hadController && !updateReady) {
      updateReady = true
      notify()
    }
    hadController = true
  })
}
