import { useEffect, useState } from 'react'
import { t } from '../i18n'
import { canPromptInstall, isIOS, isStandalone, promptInstall, subscribeInstall } from '../pwa'

/** Settings: install Nkap on the home screen (button where the browser allows it, steps otherwise). */
function InstallApp() {
  const [, refresh] = useState(0)
  const [installed, setInstalled] = useState(isStandalone)
  useEffect(() => subscribeInstall(() => refresh((n) => n + 1)), [])

  const install = async () => {
    const outcome = await promptInstall()
    if (outcome === 'accepted') setInstalled(true)
  }

  let body
  if (installed) body = <p className="text-sm font-semibold text-received">✓ {t('install.done')}</p>
  else if (canPromptInstall()) {
    body = (
      <button type="button" onClick={install} className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800">
        {t('install.button')}
      </button>
    )
  } else body = <p className="max-w-prose text-sm text-muted">{isIOS() ? t('install.ios') : t('install.other')}</p>

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-indigo-100 p-6 md:p-7">
      <div className="max-w-prose">
        <h2 className="font-display text-xl font-semibold">{t('install.title')}</h2>
        <p className="mt-1 text-sm text-muted">{t('install.text')}</p>
      </div>
      <div data-testid="install-action">{body}</div>
    </section>
  )
}

export default InstallApp
