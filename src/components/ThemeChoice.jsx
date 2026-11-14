import { t } from '../i18n'
import { THEMES, useThemeStore } from '../theme'

/** System / Light / Dark, as a segmented radio group (Settings). */
function ThemeChoice() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  return (
    <fieldset>
      <legend className="sr-only">{t('theme.title')}</legend>
      <div className="grid grid-cols-3 gap-1 rounded-md border border-field p-1">
        {THEMES.map((option) => (
          <label
            key={option}
            className={`cursor-pointer rounded px-3 py-2 text-center text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-accent ${
              theme === option ? 'bg-selected text-on-selected' : 'text-muted hover:bg-indigo-100'
            }`}
          >
            <input type="radio" name="theme" value={option} checked={theme === option} onChange={() => setTheme(option)} className="sr-only" />
            {t(`theme.${option}`)}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default ThemeChoice
