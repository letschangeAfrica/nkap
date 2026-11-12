import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-muted">The page you are looking for does not exist.</p>
      <Link to="/dashboard" className="mt-6 inline-block font-semibold text-indigo-600">Back to the dashboard</Link>
    </main>
  )
}

export default NotFound
