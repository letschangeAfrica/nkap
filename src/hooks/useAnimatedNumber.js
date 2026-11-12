import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window === 'undefined' ||
  typeof window.matchMedia !== 'function' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Rolls a displayed number to `target` over `duration` ms.
 * `from` sets the starting value on first render (e.g. 0 for a count-up).
 * Instant when the user prefers reduced motion.
 */
export function useAnimatedNumber(target, duration = 300, from) {
  const start = prefersReducedMotion() ? target : (from ?? target)
  const [value, setValue] = useState(start)
  const fromRef = useRef(start)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target)
      fromRef.current = target
      return undefined
    }
    const origin = fromRef.current
    const t0 = performance.now()
    let frame
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const next = origin + (target - origin) * (1 - Math.pow(1 - p, 3))
      setValue(next)
      fromRef.current = next
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
