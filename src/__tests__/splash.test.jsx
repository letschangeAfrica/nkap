// @vitest-environment jsdom
import { describe, test, expect, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { delayBeforeHide, hideSplash, CYCLE_MS, ASSEMBLED_FROM } from '../splash'
import { STATIC_SHELL } from '../../sw/buildServiceWorker.js'

afterEach(() => vi.useRealTimers())

describe('launch screen', () => {
  test('is plain markup with an external stylesheet (allowed by the CSP), cached for offline', () => {
    const html = readFileSync('index.html', 'utf8')
    expect(html).toContain('id="splash"')
    expect(html).toContain('<link rel="stylesheet" href="/splash.css" />')
    expect(html).not.toMatch(/<style|style="/)
    expect(html.match(/class="nk-spoke nk-s\d"/g)).toHaveLength(8)
    expect(STATIC_SHELL).toContain('/splash.css')
    const css = readFileSync('public/splash.css', 'utf8')
    expect(css).toContain('prefers-reduced-motion: reduce')
    expect(css).toContain('nk-splash-timeout') // never stuck if the app fails to start
  })

  test('fades only on the complete wheel: at least one assembly, then the next assembled moment', () => {
    expect(delayBeforeHide(200)).toBe(ASSEMBLED_FROM - 200)
    expect(delayBeforeHide(1400)).toBe(0)
    expect(delayBeforeHide(2000)).toBe(CYCLE_MS - 2000 + ASSEMBLED_FROM)
    expect(delayBeforeHide(CYCLE_MS + 1300)).toBe(0)
    expect(delayBeforeHide(200, true)).toBe(0) // reduced motion: no waiting
  })

  test('hideSplash fades then removes the element', () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="splash"></div>'
    hideSplash({ elapsed: 1300 })
    vi.advanceTimersByTime(0)
    expect(document.getElementById('splash').classList.contains('is-done')).toBe(true)
    vi.advanceTimersByTime(400)
    expect(document.getElementById('splash')).toBeNull()
  })
})
