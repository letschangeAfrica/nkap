// Shared test data. Helpers live outside the *.test.* pattern, so Vitest never runs them as tests.
import { vi, beforeEach, afterEach } from 'vitest'

/** A valid saved transfer (as it is stored after addTransfer). */
export const makeTransfer = (overrides = {}) => ({
  id: 't1',
  createdAt: 1,
  amount: 100,
  fee: 1.2,
  service: 'Wise',
  recipient: 'Maman',
  date: '2026-11-01',
  received: 64809,
  cost: 1.2,
  ...overrides,
})

/** The input a form passes to addTransfer (strings, like the UI). */
export const transferInput = (overrides = {}) => ({
  amount: '100',
  fee: '1.20',
  service: 'Wise',
  recipient: 'Maman',
  date: '2026-11-10',
  ...overrides,
})

/** The day every date-sensitive test runs on: 12 Nov 2026, midday local time. */
export const TODAY = new Date(2026, 10, 12, 12, 0)

/**
 * Pin `new Date()` / `Date.now()` for every test in the calling file.
 * Only Date is faked, so userEvent's timers keep working.
 */
export function useFixedDate(date = TODAY) {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(date)
  })
  afterEach(() => vi.useRealTimers())
}

/** Turn an en.js message with {placeholders} into a regex matching its fixed start. */
export const startsWith = (message) => new RegExp('^' + message.split('{')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
