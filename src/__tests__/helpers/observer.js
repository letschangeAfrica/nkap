import { vi } from 'vitest'

/**
 * jsdom has no IntersectionObserver. This stub records every instance so a test
 * can decide when an element "scrolls into view" with `instance.fire(true)`.
 */
export function stubIntersectionObserver() {
  const instances = []
  class FakeIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback
      this.options = options
      this.observe = vi.fn()
      this.disconnect = vi.fn()
      instances.push(this)
    }
    fire(isIntersecting) {
      this.callback([{ isIntersecting }])
    }
  }
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  return instances
}

/** jsdom has no matchMedia. `matches` maps a media-query substring to true/false. */
export function stubMatchMedia(matches = {}) {
  const mql = (query) => ({
    matches: Object.entries(matches).some(([part, value]) => value && query.includes(part)),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
  vi.stubGlobal('matchMedia', vi.fn(mql))
}
