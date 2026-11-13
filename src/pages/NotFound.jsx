import { Link } from 'react-router-dom'
import { t } from '../i18n'

function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold">{t('notFound.title')}</h1>
      <p className="mt-3 text-muted">{t('notFound.text')}</p>
      <Link to="/dashboard" className="mt-6 inline-block font-semibold text-indigo-600">{t('notFound.back')}</Link>
    </main>
  )
}

export default NotFound
