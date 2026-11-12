// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { convert, unitRate, formatMoney, fetchEurRates, readCachedRates, writeCachedRates } from '../utils/rates'

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

describe('fetchEurRates', () => {
  const ok = (body) => vi.fn().mockResolvedValue({ ok: true, json: async () => body })

  test('returns the date and the rates it knows', async () => {
    const fetchImpl = ok({ amount: 1, base: 'EUR', date: '2026-11-12', rates: { USD: 1.1, GBP: 0.85, XYZ: 3 } })
    await expect(fetchEurRates({ fetchImpl })).resolves.toEqual({ date: '2026-11-12', rates: { USD: 1.1, GBP: 0.85 } })
    expect(fetchImpl.mock.calls[0][0]).toContain('base=EUR')
  })
  test('throws on a bad status, a bad body or a network error', async () => {
    await expect(fetchEurRates({ fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 500 }) })).rejects.toThrow('500')
    await expect(fetchEurRates({ fetchImpl: ok({ hello: 'world' }) })).rejects.toThrow(/unexpected/i)
    await expect(fetchEurRates({ fetchImpl: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) })).rejects.toThrow()
  })
})

describe('rate cache', () => {
  beforeEach(() => localStorage.clear())
  test('round-trips and ignores broken values', () => {
    writeCachedRates({ date: '2026-11-12', rates: live })
    expect(readCachedRates()).toEqual({ date: '2026-11-12', rates: live })
    localStorage.setItem('nkap-rates', '{broken')
    expect(readCachedRates()).toBeNull()
  })
})
