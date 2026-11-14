// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { render, screen, act } from '@testing-library/react'
import { costByService } from '../utils/stats'
import { fetchEurRates, readCachedRates, isFresh, RATES_FRESH_MS } from '../utils/rates'
import { siteHeaders } from '../../scripts/siteHeaders.js'
import { watchForUpdates } from '../pwa'
import UpdateBanner from '../components/UpdateBanner'

const textResponse = (body) => ({ ok: true, text: async () => body })

describe('V-01: stored service names cannot reach Object.prototype', () => {
  test('"__proto__" is grouped like any other name', () => {
    const rows = costByService([{ service: '__proto__', amount: 100, fee: 2 }, { service: 'Wise', amount: 100, fee: 1 }])
    expect(rows.map((r) => r.service)).toEqual(['Wise', '__proto__'])
    expect({}.count).toBeUndefined()
  })
})

describe('V-03 / I-05: rate responses', () => {
  test('a malformed date or an oversized body is refused', async () => {
    await expect(fetchEurRates({ fetchImpl: async () => textResponse(JSON.stringify({ date: 'soon', rates: { USD: 1.1 } })) })).rejects.toThrow()
    await expect(fetchEurRates({ fetchImpl: async () => textResponse('x'.repeat(20000)) })).rejects.toThrow()
    await expect(fetchEurRates({ fetchImpl: async () => textResponse('{nope') })).rejects.toThrow()
    await expect(fetchEurRates({ fetchImpl: async () => textResponse(JSON.stringify({ date: '2026-11-13', rates: { USD: 1.1 } })) }))
      .resolves.toEqual({ date: '2026-11-13', rates: { USD: 1.1 } })
  })

  test('cached rates with a bad date are ignored; fresh means fetched less than an hour ago', () => {
    localStorage.setItem('nkap-rates', JSON.stringify({ date: '2026-02-30', rates: { USD: 1.1 } }))
    expect(readCachedRates()).toBeNull()
    const now = Date.now()
    expect(isFresh({ fetchedAt: now - 10 * 60 * 1000 }, now)).toBe(true)
    expect(isFresh({ fetchedAt: now - RATES_FRESH_MS }, now)).toBe(false)
    expect(isFresh({}, now)).toBe(false)
  })
})

describe('I-01 / I-04: headers', () => {
  test('vite preview serves the production headers (minus HTTPS-only ones)', () => {
    const h = siteHeaders(readFileSync('public/_headers', 'utf8'))
    expect(h['Content-Security-Policy']).toContain("script-src 'self'")
    expect(h['Content-Security-Policy']).not.toContain('upgrade-insecure-requests')
    expect(h['X-Frame-Options']).toBe('DENY')
    expect(h['Strict-Transport-Security']).toBeUndefined()
  })

  test('_headers adds X-Frame-Options and Cross-Origin-Resource-Policy', () => {
    const file = readFileSync('public/_headers', 'utf8')
    expect(file).toContain('X-Frame-Options: DENY')
    expect(file).toContain('Cross-Origin-Resource-Policy: same-origin')
  })
})

describe('I-03: CI', () => {
  test('every third-party action is pinned to a full commit SHA; Node 22', () => {
    const ci = readFileSync('.github/workflows/ci.yml', 'utf8')
    const uses = [...ci.matchAll(/uses:\s*(\S+)/g)].map((m) => m[1])
    expect(uses.length).toBeGreaterThan(0)
    for (const u of uses) expect(u).toMatch(/@[0-9a-f]{40}$/)
    expect(ci).not.toMatch(/node-version: 20/)
  })

  test('the test runner passes arguments without a shell', () => {
    const script = readFileSync('scripts/vitest.mjs', 'utf8')
    expect(script).not.toMatch(/shell:\s*true/)
    expect(script).toContain('process.execPath')
  })
})

describe('new version banner', () => {
  beforeEach(() => vi.useRealTimers())

  test('appears only when a newer version takes over a page that already had one', async () => {
    const listeners = []
    const container = { controller: {}, addEventListener: (_, fn) => listeners.push(fn) }
    watchForUpdates(container)
    render(<UpdateBanner />)
    expect(screen.queryByText(/new version/i)).not.toBeInTheDocument()
    act(() => listeners.forEach((fn) => fn()))
    expect(screen.getByRole('status')).toHaveTextContent('A new version of Nkap is ready.')
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })
})
