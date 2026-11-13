import RoughFilter from './RoughFilter'
import { DiamondsPattern, BricksPattern, BandPattern, Wheel } from './motifs'

/**
 * A panel composed like the cloth: two registers of alternating diamond and
 * brick columns, a wheel on each register, and an X border band at the bottom.
 * `ground` is the background colour drawn behind each wheel.
 */
function NdopCloth({ id, className = '', ground = 'var(--color-indigo-800)', rough = true }) {
  const W = 400
  const cols = [0, 80, 160, 240, 320]
  // one full-height diamond per column, like the cloth
  const register = (y, h, flip, d) =>
    cols.flatMap((x, i) =>
      (i + flip) % 2
        ? [<rect key={`${y}-${x}`} x={x} y={y} width="80" height={h} fill={`url(#${id}-b)`} />]
        : [0, 40].map((dx) => <rect key={`${y}-${x + dx}`} x={x + dx} y={y} width="40" height={h} fill={`url(#${id}-${d})`} />),
    )

  return (
    <svg className={className} viewBox={`0 0 ${W} 480`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <DiamondsPattern id={`${id}-d1`} h={196} />
        <DiamondsPattern id={`${id}-d2`} h={196} y={214} />
        <BricksPattern id={`${id}-b`} />
        <BandPattern id={`${id}-x`} />
        {rough && <RoughFilter id={`${id}-r`} />}
      </defs>
      <g filter={rough ? `url(#${id}-r)` : undefined}>
        {register(0, 196, 0, 'd1')}
        <path d={`M0 200 H${W} M0 210 H${W}`} stroke="currentColor" strokeWidth="3" />
        {register(214, 196, 1, 'd2')}
        {cols.slice(1).map((x) => <line key={x} x1={x} y1="0" x2={x} y2="410" stroke="currentColor" strokeWidth="3" />)}
        <Wheel cx={120} cy={110} r={30} ground={ground} />
        <Wheel cx={280} cy={312} r={30} ground={ground} />
        <path d={`M0 414 H${W}`} stroke="currentColor" strokeWidth="3" />
        <rect x="0" y="420" width={W} height="56" fill={`url(#${id}-x)`} />
      </g>
    </svg>
  )
}

export default NdopCloth
