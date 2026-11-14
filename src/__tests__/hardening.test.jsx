// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { parseAmount } from '../utils/currency'
import { readCachedRates, writeCachedRates } from '../utils/rates'
import { validDate, cleanText } from '../utils/validate'
import { welcomeDone, setWelcomeDone } from '../utils/welcome'
import { useTransferStore } from '../store/useTransferStore'
import { useTransactionStore } from '../store/useTransactionStore'
import { useCommitmentStore } from '../store/useCommitmentStore'
import ErrorBoundary, { STORAGE_KEYS } from '../components/ErrorBoundary'
import { makeTransfer, transferInput, useFixedDate } from './helpers/fixtures'

useFixedDate() // today is 2026-11-12

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

describe('validDate', () => {
  test.each([
    ['today', '2026-11-12', true],
    ['tomorrow', '2026-11-13', false],
    ['an impossible day', '2025-02-30', false],
    ['another format', '12/11/2026', false],
    ['no value', undefined, false],
  ])('%s → %s', (_, input, expected) => {
    expect(validDate(input)).toBe(expected)
  })
})

describe('cleanText', () => {
  test('trims and caps text', () => {
    expect(cleanText('  hi  ')).toBe('hi')
    expect(cleanText('x'.repeat(500))).toHaveLength(60)
    expect(cleanText(42)).toBe('')
  })
})

describe('stores validate at the source', () => {
  test.each([
    ['a future date', { date: '2026-11-13' }],
    ['an unknown service', { service: 'Evil Corp' }],
  ])('transfers: rejects %s', (_, patch) => {
    expect(useTransferStore.getState().addTransfer(transferInput(patch)).ok).toBe(false)
  })

  test('transfers: a long recipient name is capped at 60 characters', () => {
    expect(useTransferStore.getState().addTransfer(transferInput({ recipient: 'x'.repeat(500) })).transfer.recipient).toHaveLength(60)
  })

  test('transactions: category must belong to the type', () => {
    const { addTransaction } = useTransactionStore.getState()
    expect(addTransaction({ type: 'income', amount: '10', category: 'Rent', date: '2026-01-10' }).ok).toBe(false)
    expect(addTransaction({ type: 'expense', amount: '10', category: 'Rent', date: '2026-11-13' }).ok).toBe(false)
    expect(addTransaction({ type: 'expense', amount: '10', category: 'Rent', date: '2026-01-10' }).ok).toBe(true)
  })

  test('commitments: label is capped', () => {
    const { commitment } = useCommitmentStore.getState().addCommitment({ label: 'y'.repeat(500), monthlyXaf: '5000' })
    expect(commitment.label).toHaveLength(60)
  })

  test.each([
    ['no name', { label: '  ', monthlyXaf: '5000' }, /name/i],
    ['a zero amount', { label: 'School', monthlyXaf: '0' }, /greater than 0/i],
    ['an invalid amount', { label: 'School', monthlyXaf: 'lots' }, /greater than 0/i],
  ])('commitments: rejects %s', (_, input, error) => {
    expect(useCommitmentStore.getState().addCommitment(input).error).toMatch(error)
    expect(useCommitmentStore.getState().commitments).toEqual([])
  })
})

describe('rehydration drops malformed saved data', () => {
  const save = (key, state) => localStorage.setItem(key, JSON.stringify({ state, version: 1 }))

  test('bad transfers are filtered out, good ones kept', async () => {
    const good = makeTransfer({ id: 'a', date: '2026-01-10' })
    save('nkap-transfers', { transfers: [{}, null, { ...good, date: 5 }, good] })
    await useTransferStore.persist.rehydrate()
    expect(useTransferStore.getState().transfers).toEqual([good])
  })

  test.each([
    ['a zero amount', { amount: 0 }],
    ['a negative amount', { amount: -100 }],
    ['a fee equal to or above the amount', { fee: 150 }],
    ['a negative fee', { fee: -1 }],
    ['an impossible date', { date: '2025-02-30' }],
  ])('drops a transfer with %s', async (_, patch) => {
    save('nkap-transfers', { transfers: [makeTransfer(patch)] })
    await useTransferStore.persist.rehydrate()
    expect(useTransferStore.getState().transfers).toEqual([])
  })

  test('keeps a transfer dated after today (the device clock may have moved back)', async () => {
    const later = makeTransfer({ date: '2026-12-01' })
    save('nkap-transfers', { transfers: [later] })
    await useTransferStore.persist.rehydrate()
    expect(useTransferStore.getState().transfers).toEqual([later])
  })

  test('drops transactions and commitments with non-positive amounts', async () => {
    const tx = { id: 'x', createdAt: 1, type: 'expense', amount: 10, category: 'Food', date: '2026-01-10', note: '' }
    save('nkap-transactions', { transactions: [tx, { ...tx, id: 'y', amount: 0 }] })
    save('nkap-commitments', { commitments: [{ id: 'c', label: 'School', monthlyXaf: 50000 }, { id: 'd', label: 'Bad', monthlyXaf: -1 }] })
    await useTransactionStore.persist.rehydrate()
    await useCommitmentStore.persist.rehydrate()
    expect(useTransactionStore.getState().transactions.map((t) => t.id)).toEqual(['x'])
    expect(useCommitmentStore.getState().commitments.map((c) => c.id)).toEqual(['c'])
  })

  test('a non-array value falls back to an empty list', async () => {
    save('nkap-transactions', { transactions: 'oops' })
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

describe('blocked or full storage', () => {
  test('never breaks the app', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('full', 'QuotaExceededError') })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('denied', 'SecurityError') })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new DOMException('denied', 'SecurityError') })

    expect(() => writeCachedRates({ date: '2026-11-12', rates: { USD: 1.1 } })).not.toThrow()
    expect(readCachedRates()).toBeNull()
    expect(welcomeDone()).toBe(false)
    expect(() => setWelcomeDone()).not.toThrow()
    expect(() => setWelcomeDone(false)).not.toThrow()
  })
})

describe('ErrorBoundary', () => {
  const Boom = () => { throw new Error('bad data') }

  test('shows a recovery screen instead of a blank page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Boom /></ErrorBoundary>)

    expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i)
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument()
  })

  test('reset wipes every Nkap data key but keeps language and theme', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {}) // also hides jsdom's "navigation not implemented"
    for (const k of [...STORAGE_KEYS, 'nkap-lang', 'nkap-theme']) localStorage.setItem(k, 'x')
    render(<ErrorBoundary><Boom /></ErrorBoundary>)

    await userEvent.setup().click(screen.getByRole('button', { name: /reset data on this device/i }))

    for (const k of STORAGE_KEYS) expect(localStorage.getItem(k)).toBeNull()
    expect(localStorage.getItem('nkap-lang')).toBe('x')
    expect(localStorage.getItem('nkap-theme')).toBe('x')
  })
})
