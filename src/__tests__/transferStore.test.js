// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest'
import { useTransferStore } from '../store/useTransferStore'

const valid = { amount: '100', fee: '1.20', service: 'Wise', recipient: ' Maman, Douala ', date: '2026-11-12' }

describe('useTransferStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useTransferStore.setState({ transfers: [] })
  })

  test('adds a transfer with computed received amount and cost', () => {
    const result = useTransferStore.getState().addTransfer(valid)
    expect(result.ok).toBe(true)
    const [t] = useTransferStore.getState().transfers
    expect(t).toMatchObject({ amount: 100, fee: 1.2, received: 64809, cost: 1.2, recipient: 'Maman, Douala' })
  })

  test('rejects invalid transfers without changing the state', () => {
    const store = useTransferStore.getState()
    expect(store.addTransfer({ ...valid, fee: '150' }).ok).toBe(false)
    expect(store.addTransfer({ ...valid, recipient: '  ' }).error).toMatch(/who received/i)
    expect(store.addTransfer({ ...valid, date: '' }).ok).toBe(false)
    expect(useTransferStore.getState().transfers).toHaveLength(0)
  })

  test('removes a transfer', () => {
    const { transfer } = useTransferStore.getState().addTransfer(valid)
    useTransferStore.getState().removeTransfer(transfer.id)
    expect(useTransferStore.getState().transfers).toHaveLength(0)
  })

  test('persists to localStorage', () => {
    useTransferStore.getState().addTransfer(valid)
    const saved = JSON.parse(localStorage.getItem('nkap-transfers'))
    expect(saved.state.transfers).toHaveLength(1)
  })
})
