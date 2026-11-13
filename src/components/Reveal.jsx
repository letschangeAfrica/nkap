import { useEffect, useRef, useState } from 'react'

const canAnimate = () =>
  typeof window !== 'undefined' &&
  'IntersectionObserver' in window &&
  typeof window.matchMedia === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Fades and lifts its content in the first time it scrolls into view.
 * Content is always visible when animation is unavailable or unwanted.
 */
function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [state, setState] = useState(() => (canAnimate() ? 'hidden' : 'static'))

  useEffect(() => {
    if (state !== 'hidden' || !ref.current) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('shown')
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [state])

  const motion = state === 'static' ? '' : `nk-reveal ${state === 'shown' ? 'is-shown' : ''}`
  return (
    <Tag ref={ref} className={`${motion} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined} {...rest}>
      {children}
    </Tag>
  )
}

export default Reveal
