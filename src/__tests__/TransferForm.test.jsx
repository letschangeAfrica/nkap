// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SentHome from '../pages/SentHome'
import { useTransferStore } from '../store/useTransferStore'

describe('Sent Home page', () => {
  beforeEach(() => {
    localStorage.clear()
    useTransferStore.setState({ transfers: [] })
  })

  test('shows the live amount received and cost while typing', async () => {
    const user = userEvent.setup()
    render(<SentHome />)
    await user.type(screen.getByLabelText(/amount sent/i), '50')
    await user.type(screen.getByLabelText(/^fee/i), '8.20')
    expect(screen.getByTestId('received')).toHaveTextContent('27,419')
    expect(screen.getAllByText(/16\.4% · High/).length).toBeGreaterThan(0)
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
    expect(useTransferStore.getState().transfers).toHaveLength(1)
    expect(screen.queryByText(/no transfers yet/i)).not.toBeInTheDocument()
  })

  test('requires a recipient', async () => {
    const user = userEvent.setup()
    render(<SentHome />)
    await user.type(screen.getByLabelText(/amount sent/i), '100')
    await user.click(screen.getByRole('button', { name: /save transfer/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/who received/i)
  })
})
