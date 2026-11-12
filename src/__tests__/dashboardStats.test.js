import { describe, test, expect } from 'vitest'
import { transactionTotals, lastMonths, monthlySeries, potentialSavings, transferTotals } from '../utils/stats'
import { buildDemoData } from '../utils/demoData'

const now = new Date(2026, 10, 12) // 12 Nov 2026

describe('lastMonths', () => {
  test('returns the last 6 months, oldest first, across a year change', () => {
    expect(lastMonths(6, new Date(2026, 1, 10))).toEqual(['2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02'])
  })
})

describe('demo data', () => {
  const { transactions, transfers } = buildDemoData(now)

  test('current month matches the Part 2 designs', () => {
    expect(transactionTotals(transactions, '2026-11')).toEqual({ income: 1250, expenses: 820, balance: 430 })
    expect(transferTotals(transfers, '2026-11')).toMatchObject({ sent: 150, fees: 9.4, received: 92228, cost: 6.3 })
  })

  test('monthly series covers six months with the expected values', () => {
    const series = monthlySeries(transactions, transfers, 6, now)
    expect(series.map((m) => m.life)).toEqual([760, 800, 905, 1020, 870, 820])
    expect(series.map((m) => m.home)).toEqual([120, 150, 100, 200, 150, 150])
  })

  test('potential savings with the cheapest service', () => {
    const { cheapest, savings } = potentialSavings(transfers, '2026-11')
    expect(cheapest.service).toBe('Wise')
    expect(savings).toBeGreaterThan(7)
    expect(savings).toBeLessThan(8)
  })
})

describe('potentialSavings', () => {
  test('is 0 with fewer than two services', () => {
    expect(potentialSavings([{ amount: 100, fee: 2, service: 'Wise', date: '2026-11-01' }], '2026-11').savings).toBe(0)
  })
})
