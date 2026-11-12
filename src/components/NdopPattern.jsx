/**
 * Ndop-inspired resist-dye pattern: a grid of stitched lozenges with
 * solid centres and running-stitch bands. Pure SVG, scales to any size.
 */
function NdopPattern({ id = 'ndop', className = '', opacity = 1 }) {
  return (
    <svg className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <path d="M28 4 L52 28 L28 52 L4 28 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M28 18 L38 28 L28 38 L18 28 Z" fill="currentColor" />
          <circle cx="0" cy="0" r="3" fill="currentColor" />
          <circle cx="56" cy="0" r="3" fill="currentColor" />
          <circle cx="0" cy="56" r="3" fill="currentColor" />
          <circle cx="56" cy="56" r="3" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  )
}

export default NdopPattern
