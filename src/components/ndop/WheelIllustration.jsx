import { Wheel } from './motifs'

/** Empty-state illustration: the cloth's wheel inside a stitched ring of dots. */
function WheelIllustration({ className = 'h-20 w-20' }) {
  const dots = Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI) / 8
    return [40 + Math.cos(a) * 36, 40 + Math.sin(a) * 36]
  })
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <circle cx="40" cy="40" r="30" fill="var(--color-indigo-100)" />
      {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" className="fill-indigo-600/40" />)}
      <g className="text-indigo-600"><Wheel cx={40} cy={40} r={20} sw={2.2} /></g>
    </svg>
  )
}

export default WheelIllustration
