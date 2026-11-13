import Logo from './Logo'

/** Ndop-motif empty state used across the app. */
function EmptyState({ title, children, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <Logo className="h-12 w-12 text-indigo-100" />
      <p className="font-semibold">{title}</p>
      {children && <p className="max-w-xs text-sm text-muted">{children}</p>}
      {action}
    </div>
  )
}

export default EmptyState
