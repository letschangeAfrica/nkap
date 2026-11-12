import { describe, test, expect } from 'vitest'
import { EUR_TO_XAF, eurToXaf, xafToEur, parseAmount, transferResult, costLevel, formatEur, formatXaf } from '../utils/currency'

describe('peg conversions', () => {
  test('uses the official fixed rate', () => {
    expect(EUR_TO_XAF).toBe(655.957)
  })
  test('eurToXaf rounds to the nearest franc', () => {
    expect(eurToXaf(1)).toBe(656)
    expect(eurToXaf(98.8)).toBe(64809)
    expect(eurToXaf(0)).toBe(0)
  })
  test('xafToEur rounds to the cent', () => {
    expect(xafToEur(655.957)).toBe(1)
    expect(xafToEur(100000)).toBe(152.45)
  })
  test('rejects non-numbers', () => {
    expect(() => eurToXaf(NaN)).toThrow()
    expect(() => xafToEur('abc')).toThrow()
  })
})

describe('parseAmount', () => {
  test('accepts dots, commas and spaces', () => {
    expect(parseAmount('100')).toBe(100)
    expect(parseAmount('100,50')).toBe(100.5)
    expect(parseAmount(' 12.3 ')).toBe(12.3)
  })
  test('returns NaN for empty or invalid input', () => {
    expect(parseAmount('')).toBeNaN()
    expect(parseAmount('abc')).toBeNaN()
    expect(parseAmount(undefined)).toBeNaN()
  })
})

describe('transferResult', () => {
  test('Wise example: 100 € with a 1.20 € fee', () => {
    expect(transferResult(100, 1.2)).toEqual({ valid: true, net: 98.8, received: 64809, cost: 1.2 })
  })
  test('Western Union example: 50 € with an 8.20 € fee', () => {
    expect(transferResult('50', '8.20')).toEqual({ valid: true, net: 41.8, received: 27419, cost: 16.4 })
  })
  test('rejects invalid amounts and fees', () => {
    expect(transferResult(0, 1).valid).toBe(false)
    expect(transferResult(-10, 1).valid).toBe(false)
    expect(transferResult(100, -1).valid).toBe(false)
    expect(transferResult(10, 10).valid).toBe(false)
    expect(transferResult(10, 15).error).toMatch(/fee cannot/i)
    expect(transferResult('', '').valid).toBe(false)
  })
  test('accepts a zero fee', () => {
    expect(transferResult(10, 0)).toMatchObject({ valid: true, cost: 0 })
  })
})

describe('costLevel', () => {
  test('applies the 5 % and 10 % thresholds', () => {
    expect(costLevel(1.2)).toBe('Low')
    expect(costLevel(4.9)).toBe('Low')
    expect(costLevel(5)).toBe('Medium')
    expect(costLevel(9.9)).toBe('Medium')
    expect(costLevel(10)).toBe('High')
    expect(costLevel(16.4)).toBe('High')
  })
})

describe('formatters', () => {
  test('format EUR and XAF', () => {
    expect(formatEur(1250)).toBe('1,250.00 €')
    expect(formatXaf(92227.6)).toBe('92,228 XAF')
  })
})
