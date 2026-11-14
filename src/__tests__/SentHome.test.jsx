// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SentHome from '../pages/SentHome'
import { useTransferStore } from '../store/useTransferStore'
import { makeTransfer, useFixedDate } from './helpers/fixtures'

useFixedDate()

beforeEach(() => {
  localStorage.clear()
  useTransferStore.setState({ transfers: [] })
})

describe('Sent Home page', () => {
  test('shows the live amount received and cost while typing', async () => {
    const user = userEvent.setup()
    render(<SentHome />)

    await user.type(screen.getByLabelText(/amount sent/i), '50')
    await user.type(screen.getByLabelText(/^fee/i), '8.20')

    expect(screen.getByTestId('received')).toHaveTextContent('27,419')
    // the preview panel (the summary card shows the same badge only once saved)
    expect(screen.getByText(/41\.80 € after fee/i).parentElement).toHaveTextContent(/16\.4% · High/)
  })

  test('explains why an invalid transfer cannot be calculated', async () => {
    const user = userEvent.setup()
    render(<SentHome />)

    await user.type(screen.getByLabelText(/amount sent/i), '10')
    await user.type(screen.getByLabelText(/^fee/i), '15')

    expect(screen.getByText(/fee cannot be equal to or larger/i)).toBeInTheDocument()
  })

  test('saves a transfer and shows it in the history', async () => {
    const user = userEvent.setup()
    render(<SentHome />)
    expect(screen.getByText(/no transfers yet/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/amount sent/i), '100')
    await user.type(screen.getByLabelText(/^fee/i), '1.20')
    await user.type(screen.getByLabelText(/recipient/i), 'Maman, Douala')
    await user.click(screen.getByRole('button', { name: /save transfer/i }))

    expect(screen.getByRole('status')).toHaveTextContent('64,809 XAF to Maman, Douala')
    expect(screen.queryByText(/no transfers yet/i)).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /delete transfer to maman, douala on 12 nov 2026/i })).not.toHaveLength(0)
  })

  test('requires a recipient', async () => {
    const user = userEvent.setup()
    render(<SentHome />)

    await user.type(screen.getByLabelText(/amount sent/i), '100')
    await user.click(screen.getByRole('button', { name: /save transfer/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/who received/i)
  })
})

describe('deleting a transfer', () => {
  test('cancel keeps it, confirm removes it', async () => {
    const user = userEvent.setup()
    useTransferStore.setState({ transfers: [makeTransfer()] })
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    render(<SentHome />)
    const [del] = screen.getAllByRole('button', { name: /delete transfer to maman/i })

    await user.click(del)
    expect(useTransferStore.getState().transfers).toHaveLength(1)

    await user.click(del)
    expect(confirm).toHaveBeenCalledTimes(2)
    expect(useTransferStore.getState().transfers).toEqual([])
    expect(screen.getByText(/no transfers yet/i)).toBeInTheDocument()
  })
})

describe('user text', () => {
  test('is rendered as text, never as HTML', () => {
    const payload = '<img src=x onerror="window.__xss=1">'
    useTransferStore.setState({ transfers: [makeTransfer({ recipient: payload })] })
    render(<SentHome />)

    expect(screen.getAllByText(payload)).not.toHaveLength(0)
    expect(document.querySelector('img[src="x"]')).toBeNull()
    expect(window.__xss).toBeUndefined()
  })
})
