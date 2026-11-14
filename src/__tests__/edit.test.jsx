// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SentHome from '../pages/SentHome'
import Transactions from '../pages/Transactions'
import { useTransferStore } from '../store/useTransferStore'
import { useTransactionStore } from '../store/useTransactionStore'
import { useFixedDate } from './helpers/fixtures'

useFixedDate()

beforeEach(() => {
  localStorage.clear()
  useTransferStore.setState({ transfers: [] })
  useTransactionStore.setState({ transactions: [] })
})

describe('updateTransfer / updateTransaction', () => {
  test('recalculates what arrived, keeps the id and creation time', () => {
    const { transfer } = useTransferStore.getState().addTransfer({ amount: 100, fee: 7, service: 'Wise', recipient: 'Maman', date: '2026-11-01' })
    const res = useTransferStore.getState().updateTransfer(transfer.id, { amount: 100, fee: 1.2, service: 'Wise', recipient: 'Maman', date: '2026-11-01' })
    expect(res.ok).toBe(true)
    expect(res.transfer).toMatchObject({ id: transfer.id, createdAt: transfer.createdAt, fee: 1.2, received: 64809, cost: 1.2 })
    expect(useTransferStore.getState().transfers).toHaveLength(1)
  })

  test('applies the same validation as adding, and refuses a deleted entry', () => {
    const { transfer } = useTransferStore.getState().addTransfer({ amount: 100, fee: 1, service: 'Wise', recipient: 'Maman', date: '2026-11-01' })
    expect(useTransferStore.getState().updateTransfer(transfer.id, { amount: 10, fee: 10, service: 'Wise', recipient: 'Maman', date: '2026-11-01' }).ok).toBe(false)
    expect(useTransferStore.getState().transfers[0].fee).toBe(1)
    useTransferStore.getState().removeTransfer(transfer.id)
    expect(useTransferStore.getState().updateTransfer(transfer.id, { amount: 100, fee: 1, service: 'Wise', recipient: 'Maman', date: '2026-11-01' }))
      .toEqual({ ok: false, error: 'This entry no longer exists.' })
  })

  test('a transaction can change type and category', () => {
    const { transaction } = useTransactionStore.getState().addTransaction({ type: 'expense', amount: '20', category: 'Food', date: '2026-11-01' })
    const res = useTransactionStore.getState().updateTransaction(transaction.id, { type: 'income', amount: '20,50', category: 'Salary', date: '2026-11-01', note: 'Fixed' })
    expect(res.transaction).toMatchObject({ id: transaction.id, type: 'income', amount: 20.5, category: 'Salary', note: 'Fixed' })
  })
})

describe('editing from the pages', () => {
  test('Sent Home: edit a transfer, then cancel another edit', async () => {
    useTransferStore.getState().addTransfer({ amount: 100, fee: 7, service: 'Wise', recipient: 'Maman', date: '2026-11-01' })
    const user = userEvent.setup()
    render(<SentHome />)

    await user.click(screen.getAllByRole('button', { name: /edit transfer to maman/i })[0])
    expect(screen.getByRole('heading', { name: /edit transfer/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/amount sent/i)).toHaveValue('100')
    expect(screen.getByLabelText(/amount sent/i)).toHaveFocus()

    const fee = screen.getByLabelText(/^fee/i)
    await user.clear(fee)
    await user.type(fee, '1.20')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(screen.getByRole('status')).toHaveTextContent('Changes saved: 64,809 XAF to Maman.')
    expect(screen.getByRole('heading', { name: /new transfer/i })).toBeInTheDocument()
    expect(useTransferStore.getState().transfers[0]).toMatchObject({ fee: 1.2, received: 64809 })

    await user.click(screen.getAllByRole('button', { name: /edit transfer to maman/i })[0])
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.getByRole('heading', { name: /new transfer/i })).toBeInTheDocument()
    expect(useTransferStore.getState().transfers).toHaveLength(1)
  })

  test('Transactions: edit an expense and the monthly totals follow', async () => {
    useTransactionStore.getState().addTransaction({ type: 'expense', amount: '20', category: 'Food', date: '2026-11-01', note: 'Market' })
    const user = userEvent.setup()
    render(<MemoryRouter><Transactions /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: /edit market/i }))
    const amount = screen.getByLabelText(/^amount/i)
    await user.clear(amount)
    await user.type(amount, '35')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(screen.getByRole('status')).toHaveTextContent('Changes saved.')
    expect(within(screen.getByLabelText(/totals for/i)).getByText('35.00 €')).toBeInTheDocument()
  })
})
