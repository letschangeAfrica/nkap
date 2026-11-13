// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { parseAmount } from '../utils/currency'
import { readCachedRates } from '../utils/rates'
import { validDate, cleanText } from '../utils/validate'
import { todayISO } from '../utils/dates'
import { useTransferStore } from '../store/useTransferStore'
import { useTransactionStore } from '../store/useTransactionStore'
import { useCommitmentStore } from '../store/useCommitmentStore'
import ErrorBoundary from '../components/ErrorBoundary'

const tomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return todayISO(d)
}

beforeEach(() => {
  localStorage.clear()
  useTransferStore.setState({ transfers: [] })
  useTransactionStore.setState({ transactions: [] })
  useCommitmentStore.setState({ commitments: [] })
})

describe('parseAmount only accepts plain decimals', () => {
  test.each(['0x10', '0b11', '0o7', '1e5', '1e300', 'Infinity', '-5', '1.234', '1,000.50', '1234567890'])('rejects %s', (input) => {
    expect(parseAmount(input)).toBeNaN()
  })
  test('rejects non-finite numbers', () => {
    expect(parseAmount(Infinity)).toBeNaN()
    expect(parseAmount(NaN)).toBeNaN()
  })
  test('still accepts normal input', () => {
    expect(parseAmount('0')).toBe(0)
    expect(parseAmount('999999999.99')).toBe(999999999.99)
    expect(parseAmount('12,5')).toBe(12.5)
  })
})

describe('validDate and cleanText', () => {
  test('rejects future, malformed and impossible dates', () => {
    expect(validDate(todayISO())).toBe(true)
    expect(validDate(tomorrow())).toBe(false)
    expect(validDate('2025-02-30')).toBe(false)
    expect(validDate('12/11/2026')).toBe(false)
    expect(validDate(undefined)).toBe(false)
  })
  test('trims and caps text', () => {
    expect(cleanText('  hi  ')).toBe('hi')
    expect(cleanText('x'.repeat(500))).toHaveLength(60)
    expect(cleanText(42)).toBe('')
  })
})

describe('stores validate at the source', () => {
  const transfer = { amount: '100', fee: '1', service: 'Wise', recipient: 'Maman', date: '2026-01-10' }

  test('transfers: future dates, unknown services and long names', () => {
    const { addTransfer } = useTransferStore.getState()
    expect(addTransfer({ ...transfer, date: tomorrow() }).ok).toBe(false)
    expect(addTransfer({ ...transfer, service: 'Evil Corp' }).ok).toBe(false)
    expect(addTransfer({ ...transfer, recipient: 'x'.repeat(500) }).transfer.recipient).toHaveLength(60)
  })

  test('transactions: category must belong to the type', () => {
    const { addTransaction } = useTransactionStore.getState()
    expect(addTransaction({ type: 'income', amount: '10', category: 'Rent', date: '2026-01-10' }).ok).toBe(false)
    expect(addTransaction({ type: 'expense', amount: '10', category: 'Rent', date: tomorrow() }).ok).toBe(false)
    expect(addTransaction({ type: 'expense', amount: '10', category: 'Rent', date: '2026-01-10' }).ok).toBe(true)
  })

  test('commitments: label is capped', () => {
    const { commitment } = useCommitmentStore.getState().addCommitment({ label: 'y'.repeat(500), monthlyXaf: '5000' })
    expect(commitment.label).toHaveLength(60)
  })
})

describe('rehydration drops malformed saved data', () => {
  test('bad transfers are filtered out, good ones kept', async () => {
    const good = { id: 'a', createdAt: 1, amount: 100, fee: 1, service: 'Wise', recipient: 'Maman', date: '2026-01-10', received: 64939, cost: 1 }
    localStorage.setItem('nkap-transfers', JSON.stringify({ state: { transfers: [{}, null, { ...good, date: 5 }, good] }, version: 1 }))
    await useTransferStore.persist.rehydrate()
    expect(useTransferStore.getState().transfers).toEqual([good])
  })

  test('a non-array value falls back to an empty list', async () => {
    localStorage.setItem('nkap-transactions', JSON.stringify({ state: { transactions: 'oops' }, version: 1 }))
    await useTransactionStore.persist.rehydrate()
    expect(useTransactionStore.getState().transactions).toEqual([])
  })
})

describe('cached rates are range-checked', () => {
  test('zero, negative and non-numeric rates are dropped', () => {
    localStorage.setItem('nkap-rates', JSON.stringify({ date: '2026-11-10', rates: { USD: 0, GBP: -1, CAD: '1.5', CHF: 0.95 } }))
    expect(readCachedRates()).toEqual({ date: '2026-11-10', rates: { CHF: 0.95 } })
  })
  test('a cache with no usable rate is ignored', () => {
    localStorage.setItem('nkap-rates', JSON.stringify({ date: '2026-11-10', rates: { USD: 0 } }))
    expect(readCachedRates()).toBeNull()
  })
})

describe('ErrorBoundary', () => {
  test('shows a recovery screen instead of a blank page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const Boom = () => { throw new Error('bad data') }
    render(<ErrorBoundary><Boom /></ErrorBoundary>)
    expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i)
    expect(screen.getByRole('button', { name: /reset data on this device/i })).toBeInTheDocument()
    console.error.mockRestore()
  })
})
