// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest'
import { buildInsights } from '../utils/insights'
import { buildDemoData, clearAllData } from '../utils/demoData'
import { setWelcomeDone, welcomeDone } from '../utils/welcome'

describe('buildInsights', () => {
  const { transactions, transfers } = buildDemoData(new Date(2026, 10, 12))

  test('demo month: fees in XAF, cost trend and share of income', () => {
    expect(buildInsights({ transactions, transfers, month: '2026-11' }).map((i) => i.text)).toEqual([
      'This month, fees cost your family 6,166\u00A0XAF.',
      'Your transfers cost 6.3% this month, up from 4.3% last month.',
      'You sent home 12% of your income.',
    ])
  })

  test('says so when nothing was sent this month', () => {
    expect(buildInsights({ transactions, transfers, month: '2026-12' }).map((i) => i.id)).toEqual(['none'])
  })

  test('no data, no insights', () => {
    expect(buildInsights({ transactions: [], transfers: [], month: '2026-11' })).toEqual([])
  })

  test('January is compared with the previous December, and a cheaper month says so', () => {
    const tr = (date, fee) => ({ amount: 100, fee, received: 0, service: 'Wise', date })
    const insights = buildInsights({ transactions: [], transfers: [tr('2025-12-10', 10), tr('2026-01-10', 1)], month: '2026-01' })
    expect(insights.find((i) => i.id === 'trend').text).toBe('Your transfers cost 1% this month, down from 10% last month.')
  })
})

describe('welcome flag', () => {
  beforeEach(() => localStorage.clear())
  test('is remembered, and "delete all my data" resets it', () => {
    expect(welcomeDone()).toBe(false)
    setWelcomeDone()
    expect(welcomeDone()).toBe(true)
    clearAllData()
    expect(welcomeDone()).toBe(false)
  })
})
