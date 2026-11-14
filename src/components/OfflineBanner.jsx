import { useEffect, useState } from 'react'
import { t } from '../i18n'

/** Shown while the device is offline: everything works except live exchange rates. */
function OfflineBanner() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine === false)
  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (!offline) return null
  return (
    <p role="status" className="border-b border-warn-line bg-warn px-4 py-2 text-center text-sm text-ink">
      {t('offline.banner')}
    </p>
  )
}

export default OfflineBanner
