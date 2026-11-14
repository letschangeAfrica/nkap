import { LANGUAGES, t, useLang, useLangStore } from '../i18n'

/** Compact language picker; a <select> so it scales to any number of languages. */
function LanguageSwitcher({ tone = 'dark', className = '' }) {
  const lang = useLang()
  const setLang = useLangStore((s) => s.setLang)
  const styles =
    tone === 'dark'
      ? 'border-white/25 bg-indigo-950 text-cloth hover:border-white/50'
      : 'border-field bg-surface text-ink hover:border-accent'
  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{t('common.language')}</span>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-2.5 h-4 w-4 opacity-80" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
      </svg>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className={`cursor-pointer appearance-none rounded-md border py-1.5 pl-8 pr-3 text-sm font-semibold ${styles}`}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>{l.short} · {l.name}</option>
        ))}
      </select>
    </label>
  )
}

export default LanguageSwitcher
