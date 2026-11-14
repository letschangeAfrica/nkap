import { t } from '../i18n'
import { resolveTheme, useThemeStore } from '../theme'

/** One-tap switch between light and dark, for the top bar. Settings also offers "System". */
function ThemeToggle({ className = '' }) {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const dark = resolveTheme(theme) === 'dark'
  const label = dark ? t('theme.toLight') : t('theme.toDark')
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/25 text-cloth hover:border-white/50 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        {dark ? (
          // sun: the cloth's wheel with short rays
          <><circle cx="12" cy="12" r="4.5" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" /></>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        )}
      </svg>
    </button>
  )
}

export default ThemeToggle
