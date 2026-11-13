import WheelIllustration from './ndop/WheelIllustration'

/** Ndop-motif empty state used across the app. */
function EmptyState({ title, children, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <WheelIllustration />
      <p className="mt-1 font-semibold">{title}</p>
      {children && <p className="max-w-xs text-sm text-muted">{children}</p>}
      {action}
    </div>
  )
}

export default EmptyState
