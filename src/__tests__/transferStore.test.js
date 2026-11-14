// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest'
import { useTransferStore } from '../store/useTransferStore'
import { transferInput, useFixedDate } from './helpers/fixtures'

useFixedDate()

const valid = transferInput({ recipient: ' Maman, Douala ' })

describe('useTransferStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useTransferStore.setState({ transfers: [] })
  })

  test('adds a transfer with computed received amount and cost', () => {
    const result = useTransferStore.getState().addTransfer(valid)

    expect(result.ok).toBe(true)
    expect(useTransferStore.getState().transfers[0]).toMatchObject({ amount: 100, fee: 1.2, received: 64809, cost: 1.2, recipient: 'Maman, Douala' })
  })

  test.each([
    ['a fee larger than the amount', { fee: '150' }, /fee cannot/i],
    ['a blank recipient', { recipient: '  ' }, /who received/i],
    ['no date', { date: '' }, /date/i],
    ['a date after today', { date: '2026-11-13' }, /date/i],
  ])('rejects %s without changing the state', (_, patch, error) => {
    expect(useTransferStore.getState().addTransfer({ ...valid, ...patch }).error).toMatch(error)
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
