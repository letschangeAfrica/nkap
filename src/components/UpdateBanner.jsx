import { useEffect, useState } from 'react'
import { t } from '../i18n'
import { isUpdateReady, subscribeInstall } from '../pwa'

/** "A new version of Nkap is ready · Reload", shown when an update arrives while the app is open. */
function UpdateBanner() {
  const [ready, setReady] = useState(isUpdateReady)
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => subscribeInstall(() => setReady(isUpdateReady())), [])
  if (!ready || dismissed) return null
  return (
    <div role="status" className="fixed inset-x-4 bottom-20 z-30 mx-auto flex max-w-md items-center gap-3 rounded-lg bg-indigo-950 px-4 py-3 text-sm text-cloth shadow-[0_12px_32px_rgba(10,18,51,0.4)] ring-1 ring-white/10 lg:bottom-6">
      <p className="flex-1">{t('update.ready')}</p>
      <button type="button" onClick={() => window.location.reload()} className="rounded-md bg-cloth px-3 py-1.5 font-semibold text-indigo-950 hover:bg-mist">
        {t('update.reload')}
      </button>
      <button type="button" onClick={() => setDismissed(true)} aria-label={t('update.later')} className="px-1 text-mist/80 hover:text-cloth">
        ✕
      </button>
    </div>
  )
}

export default UpdateBanner
