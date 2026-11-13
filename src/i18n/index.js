import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import en from './en'
import fr from './fr'
import wes from './wes'

/**
 * Languages offered in the app. To add one: create src/i18n/<code>.js with
 * the same keys as en.js, import it here and add a line below.
 */
export const LANGUAGES = [
  { code: 'en', name: 'English', short: 'EN', locale: 'en-US', dateLocale: 'en-GB', xaf: 'XAF', dict: en },
  { code: 'fr', name: 'Français', short: 'FR', locale: 'fr-FR', dateLocale: 'fr-FR', xaf: 'FCFA', dict: fr },
  // Cameroonian Pidgin English (draft, to be reviewed by a native speaker)
  { code: 'wes', name: 'Pidgin (Kamtok)', short: 'PID', locale: 'en-GB', dateLocale: 'en-GB', xaf: 'FCFA', dict: wes },
]
const byCode = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]))

/** First visit: use the browser's language when we have it, else English. */
export function detectLanguage() {
  const prefs = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language]
  for (const p of prefs) {
    const code = String(p || '').split('-')[0].toLowerCase()
    if (byCode[code]) return code
  }
  return 'en'
}

export const useLangStore = create(
  persist(
    (set) => ({
      lang: detectLanguage(),
      setLang: (code) => byCode[code] && set({ lang: code }),
    }),
    {
      name: 'nkap-lang',
      partialize: (s) => ({ lang: s.lang }),
      merge: (saved, current) => ({ ...current, lang: byCode[saved?.lang] ? saved.lang : current.lang }),
    },
  ),
)

export const getLang = () => useLangStore.getState().lang
export const langInfo = () => byCode[getLang()] ?? byCode.en
export const useLang = () => useLangStore((s) => s.lang)

const lookup = (dict, key) => key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict)

/**
 * Translate a key like "nav.dashboard". `{name}` placeholders are filled from
 * `vars`. Falls back to English, then to the key itself, so nothing is blank.
 */
export function t(key, vars) {
  let text = lookup(langInfo().dict, key)
  if (typeof text !== 'string') text = lookup(en, key)
  if (typeof text !== 'string') return key
  return vars ? text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m)) : text
}

/** Validation messages are produced in English by the stores; show them in the current language. */
export const tError = (message) => langInfo().dict.errors?.[message] ?? message

/** Plain number in the current language: 1,250 (EN) or 1 250 (FR). */
export const formatNumber = (n, options) => n.toLocaleString(langInfo().locale, options)
