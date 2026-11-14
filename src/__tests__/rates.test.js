// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { convert, unitRate, formatMoney, formatRate, fetchEurRates, readCachedRates, writeCachedRates } from '../utils/rates'

const live = { USD: 1.1, GBP: 0.85 }

describe('convert', () => {
  test('EUR ⇄ XAF uses the fixed peg without live rates', () => {
    expect(convert(100, 'EUR', 'XAF')).toBeCloseTo(65595.7)
    expect(convert(655.957, 'XAF', 'EUR')).toBeCloseTo(1)
  })
  test('other pairs go through the euro', () => {
    expect(convert(110, 'USD', 'EUR', live)).toBeCloseTo(100)
    expect(convert(1, 'GBP', 'XAF', live)).toBeCloseTo(655.957 / 0.85)
    expect(unitRate('USD', 'GBP', live)).toBeCloseTo(0.85 / 1.1)
  })
  test('returns null when a rate is missing or the amount is invalid', () => {
    expect(convert(100, 'EUR', 'USD', {})).toBeNull()
    expect(convert(NaN, 'EUR', 'XAF')).toBeNull()
  })
})

describe('formatMoney', () => {
  test('XAF has no decimals, EUR uses the € sign', () => {
    expect(formatMoney(65595.7, 'XAF')).toBe('65,596 XAF')
    expect(formatMoney(1250, 'EUR')).toBe('1,250.00 €')
    expect(formatMoney(12.5, 'USD')).toBe('12.50 USD')
  })
})

describe('formatRate', () => {
  test.each([
    [655.957, '655.957'],
    [1.23456, '1.2346'],
    [1 / 655.957, '0.001524'],
  ])('%s → %s', (n, text) => {
    expect(formatRate(n)).toBe(text)
  })
})

describe('fetchEurRates', () => {
  const ok = (body) => vi.fn().mockResolvedValue({ ok: true, json: async () => body })
  // a fetch that only settles when it is aborted
  const hanging = () => vi.fn((_, { signal }) => new Promise((_, reject) => {
    const fail = () => reject(new DOMException('Aborted', 'AbortError'))
    if (signal.aborted) fail()
    signal.addEventListener('abort', fail)
  }))

  afterEach(() => vi.useRealTimers())

  test('returns the date and the rates it knows', async () => {
    const fetchImpl = ok({ amount: 1, base: 'EUR', date: '2026-11-12', rates: { USD: 1.1, GBP: 0.85, XYZ: 3 } })
    await expect(fetchEurRates({ fetchImpl })).resolves.toEqual({ date: '2026-11-12', rates: { USD: 1.1, GBP: 0.85 } })
    expect(fetchImpl.mock.calls[0][0]).toContain('base=EUR')
  })

  test.each([
    ['a bad status', vi.fn().mockResolvedValue({ ok: false, status: 500 }), '500'],
    ['an unexpected body', ok({ hello: 'world' }), /unexpected/i],
    ['a network error', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')), /failed to fetch/i],
  ])('throws on %s', async (_, fetchImpl, error) => {
    await expect(fetchEurRates({ fetchImpl })).rejects.toThrow(error)
  })

  test('gives up after the timeout', async () => {
    vi.useFakeTimers()
    const p = fetchEurRates({ fetchImpl: hanging(), timeoutMs: 50 })
    vi.advanceTimersByTime(50)
    await expect(p).rejects.toThrow(/abort/i)
  })

  test('can be cancelled by the caller', async () => {
    const caller = new AbortController()
    const p = fetchEurRates({ fetchImpl: hanging(), signal: caller.signal })
    caller.abort()
    await expect(p).rejects.toThrow(/abort/i)
  })

  test('an already-cancelled signal aborts straight away', async () => {
    const caller = new AbortController()
    caller.abort()
    const fetchImpl = hanging()
    await expect(fetchEurRates({ fetchImpl, signal: caller.signal })).rejects.toThrow()
    expect(fetchImpl.mock.calls[0][1].signal.aborted).toBe(true)
  })
})

describe('rate cache', () => {
  beforeEach(() => localStorage.clear())

  test('round-trips saved rates', () => {
    writeCachedRates({ date: '2026-11-12', rates: live })
    expect(readCachedRates()).toEqual({ date: '2026-11-12', rates: live })
  })

  test('ignores a broken saved value', () => {
    localStorage.setItem('nkap-rates', '{broken')
    expect(readCachedRates()).toBeNull()
  })
})
