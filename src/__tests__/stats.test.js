import { describe, test, expect } from 'vitest'
import { transferTotals, costByService, sortByDateDesc, transactionTotals, potentialSavings } from '../utils/stats'

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

describe('transactionTotals', () => {
  test('without a month, totals every transaction', () => {
    const transactions = [
      { type: 'income', amount: 1000, date: '2026-10-01' },
      { type: 'expense', amount: 250.5, date: '2026-10-03' },
      { type: 'expense', amount: 100, date: '2026-11-03' },
    ]
    expect(transactionTotals(transactions)).toEqual({ income: 1000, expenses: 350.5, balance: 649.5 })
  })
})

describe('performance', () => {
  test('dashboard maths stays fast with ten years of transfers', () => {
    const services = ['Wise', 'Western Union', 'Orange Money']
    const many = Array.from({ length: 5000 }, (_, i) => ({
      amount: 100, fee: 1 + (i % 5), received: 64000, service: services[i % 3],
      date: `20${16 + (i % 10)}-0${1 + (i % 9)}-10`, createdAt: i,
    }))
    const t0 = performance.now()
    transferTotals(many, '2026-01')
    costByService(many)
    potentialSavings(many, '2026-01')
    sortByDateDesc(many)
    expect(performance.now() - t0).toBeLessThan(200) // generous, to stay stable on slow CI machines
  })
})

describe('sortByDateDesc', () => {
  test('newest first, without mutating the input', () => {
    const shuffled = [transfers[2], transfers[0], transfers[1]]
    expect(sortByDateDesc(shuffled).map((t) => t.date)).toEqual(['2026-11-12', '2026-11-03', '2026-10-14'])
    expect(shuffled[0].date).toBe('2026-10-14')
  })
})
