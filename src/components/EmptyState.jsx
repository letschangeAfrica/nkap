/** Ndop-motif empty state used across the app. */
function EmptyState({ title, children, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <svg viewBox="0 0 48 48" className="h-12 w-12 text-indigo-100" aria-hidden="true">
        <path d="M24 3 L45 24 L24 45 L3 24 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="24" cy="24" r="5" fill="currentColor" />
      </svg>
      <p className="font-semibold">{title}</p>
      {children && <p className="max-w-xs text-sm text-muted">{children}</p>}
      {action}
    </div>
  )
}

export default EmptyState
