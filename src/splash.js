/*
 * Removes the launch screen from index.html once the app has rendered.
 * It waits for the wheel to be fully assembled (at least one round), so the
 * screen fades out on the complete logo, never halfway through.
 */
export const CYCLE_MS = 2400
// The wheel is complete between these times in each round (all spokes in, hub shown)
export const ASSEMBLED_FROM = 1250
export const ASSEMBLED_UNTIL = 1700

/** How long to wait before fading, given the time since the page started loading. */
export function delayBeforeHide(elapsed, reducedMotion = false) {
  if (reducedMotion) return 0
  const phase = elapsed % CYCLE_MS
  if (elapsed >= ASSEMBLED_FROM && phase >= ASSEMBLED_FROM && phase <= ASSEMBLED_UNTIL) return 0
  return phase < ASSEMBLED_FROM ? ASSEMBLED_FROM - phase : CYCLE_MS - phase + ASSEMBLED_FROM
}

export function hideSplash({ doc = document, elapsed = performance.now() } = {}) {
  const el = doc.getElementById('splash')
  if (!el) return
  const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  setTimeout(() => {
    el.classList.add('is-done')
    setTimeout(() => el.remove(), 400)
  }, delayBeforeHide(elapsed, reduced))
}
