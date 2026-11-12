import { describe, test, expect } from 'vitest'
import { transferTotals, costByService, sortByDateDesc } from '../utils/stats'

const transfers = [
  { amount: 100, fee: 1.2, received: 64809, service: 'Wise', date: '2026-11-12', createdAt: 2 },
  { amount: 50, fee: 8.2, received: 27419, service: 'Western Union', date: '2026-11-03', createdAt: 1 },
  { amount: 150, fee: 6.45, received: 94163, service: 'Orange Money', date: '2026-10-14', createdAt: 0 },
]

describe('transferTotals', () => {
  test('totals for one month match the design example', () => {
    expect(transferTotals(transfers, '2026-11')).toEqual({ count: 2, sent: 150, fees: 9.4, received: 92228, cost: 6.3 })
  })
  test('totals for all months', () => {
    expect(transferTotals(transfers).count).toBe(3)
  })
  test('empty list gives zeros', () => {
    expect(transferTotals([], '2026-11')).toEqual({ count: 0, sent: 0, fees: 0, received: 0, cost: 0 })
  })
})

describe('costByService', () => {
  test('cheapest service first', () => {
    expect(costByService(transfers).map((s) => [s.service, s.cost])).toEqual([
      ['Wise', 1.2],
      ['Orange Money', 4.3],
      ['Western Union', 16.4],
    ])
  })
})

describe('sortByDateDesc', () => {
  test('newest first, without mutating the input', () => {
    const shuffled = [transfers[2], transfers[0], transfers[1]]
    expect(sortByDateDesc(shuffled).map((t) => t.date)).toEqual(['2026-11-12', '2026-11-03', '2026-10-14'])
    expect(shuffled[0].date).toBe('2026-10-14')
  })
})
