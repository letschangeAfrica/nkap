// @vitest-environment jsdom
// Regression tests for the business-logic review (B-01, B-02, B-03).
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { useTransferStore } from '../store/useTransferStore'
import { useTransactionStore } from '../store/useTransactionStore'
import { useCommitmentStore } from '../store/useCommitmentStore'
import { syncStoresAcrossTabs } from '../store/syncTabs'
import { transferResult, costPercent, costLevel } from '../utils/currency'
import { transferTotals, costByService } from '../utils/stats'

const transfer = (id, recipient) => ({ id, createdAt: 1, amount: 200, fee: 2, service: 'Wise', recipient, date: '2026-11-10', received: 129880, cost: 1 })
const saved = (key, list) => JSON.parse(localStorage.getItem(key)).state[list]
const recipients = () => saved('nkap-transfers', 'transfers').map((t) => t.recipient).sort()

/** What another tab does: write the key, and the browser fires `storage` in this tab. */
function otherTabWrites(key, state) {
  const newValue = state === null ? null : JSON.stringify({ state, version: 1 })
  if (newValue === null) localStorage.removeItem(key)
  else localStorage.setItem(key, newValue)
  window.dispatchEvent(new StorageEvent('storage', { key, newValue, storageArea: localStorage }))
}

beforeEach(() => {
  localStorage.clear()
  useTransferStore.setState({ transfers: [] })
  useTransactionStore.setState({ transactions: [] })
  useCommitmentStore.setState({ commitments: [] })
})

describe('B-01: two tabs never overwrite each other', () => {
  let stop
  afterEach(() => stop?.())

  test('a save here keeps what another tab saved (even without the storage event)', () => {
    // The other tab wrote, but this tab's memory is stale and no event arrived yet.
    localStorage.setItem('nkap-transfers', JSON.stringify({ state: { transfers: [transfer('b', 'From tab B')] }, version: 1 }))
    useTransferStore.getState().addTransfer({ amount: '100', fee: '1', service: 'Wise', recipient: 'From tab A', date: '2026-11-11' })
    expect(recipients()).toEqual(['From tab A', 'From tab B'])
  })

  test('a delete here does not erase what another tab added', () => {
    useTransferStore.setState({ transfers: [transfer('a', 'Old')] })
    localStorage.setItem('nkap-transfers', JSON.stringify({ state: { transfers: [transfer('b', 'New from B'), transfer('a', 'Old')] }, version: 1 }))
    useTransferStore.getState().removeTransfer('a')
    expect(recipients()).toEqual(['New from B'])
  })

  test('the same holds for transactions and commitments', () => {
    localStorage.setItem('nkap-transactions', JSON.stringify({ state: { transactions: [{ id: 'b', createdAt: 1, type: 'expense', amount: 5, category: 'Food', date: '2026-11-10', note: 'B' }] }, version: 1 }))
    useTransactionStore.getState().addTransaction({ type: 'expense', amount: '10', category: 'Rent', date: '2026-11-11' })
    expect(saved('nkap-transactions', 'transactions')).toHaveLength(2)

    localStorage.setItem('nkap-commitments', JSON.stringify({ state: { commitments: [{ id: 'b', label: 'B', monthlyXaf: 1000 }] }, version: 1 }))
    useCommitmentStore.getState().addCommitment({ label: 'A', monthlyXaf: '2000' })
    expect(saved('nkap-commitments', 'commitments').map((c) => c.label)).toEqual(['B', 'A'])
  })

  test('another tab saving updates this tab right away', () => {
    stop = syncStoresAcrossTabs()
    otherTabWrites('nkap-transfers', { transfers: [transfer('b', 'From tab B')] })
    expect(useTransferStore.getState().transfers.map((t) => t.recipient)).toEqual(['From tab B'])
  })

  test('"Delete all my data" in another tab is not undone by this tab', () => {
    stop = syncStoresAcrossTabs()
    useTransferStore.setState({ transfers: [transfer('a', 'Private')] })
    otherTabWrites('nkap-transfers', { transfers: [] }) // clearTransfers() in the other tab
    expect(useTransferStore.getState().transfers).toEqual([])
    useTransactionStore.getState().addTransaction({ type: 'expense', amount: '10', category: 'Rent', date: '2026-11-11' })
    expect(saved('nkap-transfers', 'transfers')).toEqual([])
  })

  test('a key removed by another tab (error-screen reset) empties this tab too', () => {
    stop = syncStoresAcrossTabs()
    useCommitmentStore.setState({ commitments: [{ id: 'x', label: 'Private', monthlyXaf: 5000 }] })
    otherTabWrites('nkap-commitments', null)
    expect(useCommitmentStore.getState().commitments).toEqual([])
  })

  test('localStorage.clear() in another tab empties every store', () => {
    stop = syncStoresAcrossTabs()
    useTransferStore.setState({ transfers: [transfer('a', 'A')] })
    useCommitmentStore.setState({ commitments: [{ id: 'x', label: 'X', monthlyXaf: 5000 }] })
    localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', { key: null, storageArea: localStorage }))
    expect(useTransferStore.getState().transfers).toEqual([])
    expect(useCommitmentStore.getState().commitments).toEqual([])
  })

  test('tampered data from another tab still goes through validation', () => {
    stop = syncStoresAcrossTabs()
    otherTabWrites('nkap-transfers', { transfers: [{}, { id: 'bad', amount: -5 }, transfer('ok', 'Valid')] })
    expect(useTransferStore.getState().transfers.map((t) => t.id)).toEqual(['ok'])
  })
})

describe('B-02: commitments are whole francs and survive a reload', () => {
  test.each(['0.4', '0', '0,9', '50000,5', '50000.5', '-100', '1e5', ''])('rejects %s', (input) => {
    expect(useCommitmentStore.getState().addCommitment({ label: 'X', monthlyXaf: input }).ok).toBe(false)
    expect(useCommitmentStore.getState().commitments).toEqual([])
  })

  test('accepts whole francs and keeps them after a reload', async () => {
    const r = useCommitmentStore.getState().addCommitment({ label: 'School fees', monthlyXaf: ' 50000 ' })
    expect(r.commitment.monthlyXaf).toBe(50000)
    await useCommitmentStore.persist.rehydrate()
    expect(useCommitmentStore.getState().commitments.map((c) => c.monthlyXaf)).toEqual([50000])
  })
})

describe('B-03: cost % rounds half-way cases consistently', () => {
  test.each([
    ['4.94', 4.9, 'Low'],
    ['4.95', 5, 'Medium'],
    ['9.94', 9.9, 'Medium'],
    ['9.95', 10, 'High'], // was 9.9 % / Medium with float maths
  ])('fee %s € on 100 € → %s %% (%s)', (fee, cost, level) => {
    const r = transferResult('100', fee)
    expect(r.cost).toBe(cost)
    expect(costLevel(r.cost)).toBe(level)
  })

  test('totals and per-service averages use the same rounding', () => {
    const list = [{ amount: 100, fee: 9.95, received: 0, service: 'Wise', date: '2026-11-01' }]
    expect(transferTotals(list).cost).toBe(10)
    expect(costByService(list)[0].cost).toBe(10)
    expect(costPercent(0, 0)).toBe(0)
  })
})
