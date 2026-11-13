import { BandPattern } from './motifs'

/** The cloth's X border band, used as a strip between sections. */
function NdopBand({ id, className = 'h-3.5 text-cloth/25' }) {
  return (
    <svg className={`block w-full ${className}`} aria-hidden="true">
      <defs>
        <BandPattern id={id} w={14} h={14} sw={1.6} />
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export default NdopBand
