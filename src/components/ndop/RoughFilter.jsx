/**
 * Makes crisp SVG lines look hand-painted and resist-dyed, like real Ndop:
 * slightly wobbly edges and a broken, speckled texture.
 */
function RoughFilter({ id, scale = 2.5 }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale={scale} xChannelSelector="R" yChannelSelector="G" result="wobbly" />
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="3" result="grain" />
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.75" result="speckle" />
      <feComposite in="wobbly" in2="speckle" operator="in" />
    </filter>
  )
}

export default RoughFilter
