// Nkap mark: the eight-spoke wheel from Ndop cloth
function Logo({ className = 'h-7 w-7' }) {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 + Math.PI / 8
    return [16 + Math.cos(a) * 11.5, 16 + Math.sin(a) * 11.5]
  })
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2.2" />
      {spokes.map(([x, y], i) => (
        <line key={i} x1="16" y1="16" x2={x} y2={y} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ))}
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  )
}

export default Logo
