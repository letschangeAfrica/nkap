// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SentHome from '../pages/SentHome'
import { useTransferStore } from '../store/useTransferStore'
import { useCommitmentStore } from '../store/useCommitmentStore'
import { recentRecipients } from '../utils/stats'
import { useFixedDate } from './helpers/fixtures'

useFixedDate() // 12 Nov 2026

const tx = (id, recipient, service, date, amount = 100, fee = 1.2) => ({ id, recipient, service, date, amount, fee, received: 1, cost: 1 })

beforeEach(() => {
  localStorage.clear()
  useTransferStore.setState({ transfers: [] })
  useCommitmentStore.setState({ commitments: [] })
})

describe('recentRecipients', () => {
  test('latest transfer per recipient and service, newest first, at most 3', () => {
    const list = [
      tx('a', 'Maman', 'Wise', '2026-10-01'),
      tx('b', 'maman', 'Wise', '2026-11-01'),
      tx('c', 'Papa', 'Western Union', '2026-11-03'),
      tx('d', 'Maman', 'Orange Money', '2026-09-01'),
      tx('e', 'School', 'Orange Money', '2026-08-01'),
    ]
    expect(recentRecipients(list).map((t) => t.id)).toEqual(['c', 'b', 'd'])
  })
})

describe('Send again', () => {
  test('no chips before the first transfer', () => {
    render(<SentHome />)
    expect(screen.queryByText('Send again')).not.toBeInTheDocument()
  })

  test('one tap fills the form (dated today, same commitment) and saves a new transfer', async () => {
    useCommitmentStore.setState({ commitments: [{ id: 'c1', label: 'Support for Maman', monthlyXaf: 60000 }] })
    useTransferStore.setState({ transfers: [{ ...tx('old', 'Maman, Douala', 'Wise', '2026-10-12', 100, 1.2), received: 64809, cost: 1.2, commitmentId: 'c1' }] })
    const user = userEvent.setup()
    render(<SentHome />)

    await user.click(screen.getByRole('button', { name: /send again to maman, douala with wise/i }))
    expect(screen.getByLabelText(/amount sent/i)).toHaveValue('100')
    expect(screen.getByLabelText(/^fee/i)).toHaveValue('1.2')
    expect(screen.getByLabelText(/recipient/i)).toHaveValue('Maman, Douala')
    expect(screen.getByLabelText(/counts towards/i)).toHaveValue('c1')
    expect(screen.getByLabelText(/^date/i)).toHaveValue('2026-11-12')
    expect(screen.getByRole('status')).toHaveTextContent(/filled in from the transfer to maman, douala/i)
    expect(screen.getByTestId('received')).toHaveTextContent('64,809')

    await user.click(screen.getByRole('button', { name: /save transfer/i }))
    const saved = useTransferStore.getState().transfers
    expect(saved).toHaveLength(2)
    expect(saved[0]).toMatchObject({ date: '2026-11-12', recipient: 'Maman, Douala', commitmentId: 'c1' })
  })
})
