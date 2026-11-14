import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** 'system' follows the device; 'light' and 'dark' are explicit choices. */
export const THEMES = ['system', 'light', 'dark']
export const THEME_KEY = 'nkap-theme'

const systemPrefersDark = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches

export const resolveTheme = (pref) => (pref === 'dark' || (pref === 'system' && systemPrefersDark()) ? 'dark' : 'light')

/** Put the resolved theme on <html data-theme> and the browser UI colour. */
export function applyTheme(pref, { animate = false } = {}) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const theme = resolveTheme(pref)
  if (animate) {
    root.classList.add('nk-theme-anim')
    setTimeout(() => root.classList.remove('nk-theme-anim'), 250)
  }
  root.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0C1230' : '#0A1233')
}

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        if (!THEMES.includes(theme)) return
        set({ theme })
        applyTheme(theme, { animate: true })
      },
    }),
    {
      name: THEME_KEY,
      partialize: (s) => ({ theme: s.theme }),
      merge: (saved, current) => ({ ...current, theme: THEMES.includes(saved?.theme) ? saved.theme : current.theme }),
    },
  ),
)

/** Apply the saved choice and follow the device while on "system". Call once at start-up. */
export function initTheme() {
  applyTheme(useThemeStore.getState().theme)
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (useThemeStore.getState().theme === 'system') applyTheme('system', { animate: true })
  })
}
