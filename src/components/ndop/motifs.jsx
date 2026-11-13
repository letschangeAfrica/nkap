/*
 * The four motifs of the Ndop cloth used in Nkap, as SVG <pattern>s.
 * Lines use currentColor so the same motif works cream-on-indigo or indigo-on-white.
 */

/** Long vertical diamonds with dotted triangles between them. */
export function DiamondsPattern({ id, w = 40, h = 120, sw = 3, y = 0 }) {
  const dots = []
  // dots fill the triangles between neighbouring diamonds
  const rows = Math.floor(h / 2 / 8) - 1
  for (let row = 0; row < rows; row += 1) {
    const dy = 8 + row * 8
    const spread = ((w / 2 - 6) * (1 - dy / (h / 2)))
    for (let x = 4; x < spread; x += 6) {
      dots.push([x, dy], [w - x, dy], [x, h - dy], [w - x, h - dy])
    }
  }
  return (
    <pattern id={id} y={y} width={w} height={h} patternUnits="userSpaceOnUse">
      <path d={`M${w / 2} 0 L${w - 3} ${h / 2} L${w / 2} ${h} L3 ${h / 2} Z`} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
      <path d={`M${w / 2} 22 L${w - 13} ${h / 2} L${w / 2} ${h - 22} L13 ${h / 2} Z`} fill="none" stroke="currentColor" strokeWidth={sw * 0.6} />
      <path d={`M${w / 2} 40 V${h - 40}`} stroke="currentColor" strokeWidth={sw * 0.5} strokeDasharray="2 5" />
      {dots.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" fill="currentColor" />)}
    </pattern>
  )
}

/** Irregular brick / ladder grid. */
export function BricksPattern({ id, w = 48, h = 32, sw = 3 }) {
  return (
    <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
      <path
        d={`M0 1 H${w} M0 ${h / 2} H${w} M${w * 0.3} 1 V${h / 2} M${w * 0.78} 1 V${h / 2} M${w * 0.05} ${h / 2} V${h} M${w * 0.55} ${h / 2} V${h}`}
        fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="square"
      />
    </pattern>
  )
}

/** Border band: a row of X / hourglass shapes between two lines. */
export function BandPattern({ id, w = 24, h = 28, sw = 2.5 }) {
  return (
    <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
      <path d={`M0 2 H${w} M0 ${h - 2} H${w} M3 6 L${w - 3} ${h - 6} M${w - 3} 6 L3 ${h - 6}`} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
    </pattern>
  )
}

/** The wheel: a circle with eight spokes. */
export function Wheel({ cx, cy, r, sw = 3, ground }) {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 + Math.PI / 8
    return [cx + Math.cos(a) * r * 0.92, cy + Math.sin(a) * r * 0.92]
  })
  return (
    <g fill="none">
      {ground && <circle cx={cx} cy={cy} r={r + 6} fill={ground} stroke="none" />}
      <circle cx={cx} cy={cy} r={r} stroke="currentColor" strokeWidth={sw} />
      {spokes.map(([x, y], i) => <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeWidth={sw * 0.8} strokeLinecap="round" />)}
      <circle cx={cx} cy={cy} r={r * 0.14} fill="currentColor" stroke="none" />
    </g>
  )
}
