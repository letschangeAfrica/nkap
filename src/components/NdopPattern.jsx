import { DiamondsPattern } from './ndop/motifs'

/** Repeating field of the cloth's long dotted diamonds, for backgrounds. */
function NdopPattern({ id = 'ndop', className = '', opacity = 1 }) {
  return (
    <svg className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <DiamondsPattern id={id} w={32} h={96} sw={2} />
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  )
}

export default NdopPattern
