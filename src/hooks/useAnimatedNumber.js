import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window === 'undefined' ||
  typeof window.matchMedia !== 'function' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Rolls a displayed number to `target` over `duration` ms (instant if reduced motion). */
export function useAnimatedNumber(target, duration = 300) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target)
      fromRef.current = target
      return undefined
    }
    const from = fromRef.current
    const start = performance.now()
    let frame
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const next = from + (target - from) * eased
      setValue(next)
      fromRef.current = next
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
