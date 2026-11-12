// Ndop-inspired mark: stitched lozenge with a solid centre
function Logo({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 2 L30 16 L16 30 L2 16 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2.5" />
      <path d="M16 9 L23 16 L16 23 L9 16 Z" fill="currentColor" />
    </svg>
  )
}

export default Logo
