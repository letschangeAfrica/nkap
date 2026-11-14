// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Transactions from '../pages/Transactions'
import Settings from '../pages/Settings'
import Layout from '../components/Layout'
import { clearAllData } from '../utils/demoData'
import { useTransactionStore } from '../store/useTransactionStore'
import { useTransferStore } from '../store/useTransferStore'
import { useCommitmentStore } from '../store/useCommitmentStore'
import { makeTransfer, useFixedDate } from './helpers/fixtures'

useFixedDate() // 12 Nov 2026

const renderPage = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

beforeEach(() => {
  localStorage.clear()
  clearAllData()
})

describe('Dashboard', () => {
  test('first visit: three welcome steps, then demo data shows the figures and insights', async () => {
    const user = userEvent.setup()
    renderPage(<Dashboard />)
    expect(screen.getByText(/welcome to nkap/i)).toBeInTheDocument()
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^next$/i }))
    await user.click(screen.getByRole('button', { name: /^next$/i }))
    expect(screen.getByText(/step 3 of 3/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /explore with demo data/i }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/november 2026/i)
    expect(within(screen.getByLabelText(/key figures/i)).getByText(/92,228 XAF/)).toBeInTheDocument()
    expect(screen.getByText(/cheapest service so far/i)).toBeInTheDocument()
    expect(screen.getByText('This month, fees cost your family 6,166 XAF.')).toBeInTheDocument()
    expect(localStorage.getItem('nkap-welcome-done')).toBe('1')
  })

  test('after skipping the welcome, an empty dashboard shows the wheel empty state', async () => {
    const user = userEvent.setup()
    renderPage(<Dashboard />)
    await user.click(screen.getByRole('button', { name: /skip/i }))
    expect(screen.getByText(/nothing recorded yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /explore with demo data/i })).toBeInTheDocument()
  })
})

describe('Transactions', () => {
  test('adds an expense and updates the monthly totals', async () => {
    const user = userEvent.setup()
    renderPage(<Transactions />)

    await user.type(screen.getByLabelText(/^amount/i), '46.80')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Food')
    await user.type(screen.getByLabelText(/note/i), 'Groceries')
    await user.click(screen.getByRole('button', { name: /save expense/i }))

    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByLabelText(/totals for/i)).toHaveTextContent('46.80 €')
  })

  test('switching to income changes the categories and the button', async () => {
    const user = userEvent.setup()
    renderPage(<Transactions />)
    await user.click(screen.getByLabelText(/^income$/i))
    expect(screen.getByRole('option', { name: 'Salary' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save income/i })).toBeInTheDocument()
  })

  test('rejects an empty amount', async () => {
    const user = userEvent.setup()
    renderPage(<Transactions />)
    await user.click(screen.getByRole('button', { name: /save expense/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/greater than 0/i)
  })

  test('deletes a transaction only after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    useTransactionStore.getState().addTransaction({ type: 'expense', amount: '10', category: 'Food', date: '2026-11-10', note: 'Bread' })
    renderPage(<Transactions />)
    const del = screen.getByRole('button', { name: 'Delete Bread on 10 Nov 2026' })

    await user.click(del)
    expect(screen.getByText('Bread')).toBeInTheDocument()

    await user.click(del)
    expect(screen.queryByText('Bread')).not.toBeInTheDocument()
    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument()
  })
})

describe('Settings', () => {
  test('adds a commitment and deletes all data after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderPage(<Settings />)

    await user.type(screen.getByLabelText(/^name/i), 'School fees')
    await user.type(screen.getByLabelText(/per month/i), '50000')
    await user.click(screen.getByRole('button', { name: /^add$/i }))
    expect(screen.getByText('School fees')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /delete all my data/i }))
    expect(screen.queryByText('School fees')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/deleted/i)
  })

  test('shows why a commitment cannot be added', async () => {
    const user = userEvent.setup()
    renderPage(<Settings />)
    await user.type(screen.getByLabelText(/per month/i), '50000')
    await user.click(screen.getByRole('button', { name: /^add$/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/name/i)
  })

  test('removes one commitment and updates the total', async () => {
    const user = userEvent.setup()
    useCommitmentStore.setState({ commitments: [{ id: 'a', label: 'School', monthlyXaf: 50000 }, { id: 'b', label: 'Rent', monthlyXaf: 30000 }] })
    renderPage(<Settings />)
    expect(screen.getByText(/^total/i).parentElement).toHaveTextContent('80,000 XAF')

    await user.click(screen.getByRole('button', { name: 'Remove School' }))

    expect(screen.queryByText('School')).not.toBeInTheDocument()
    expect(screen.getByText(/^total/i).parentElement).toHaveTextContent('30,000 XAF')
  })

  test('"delete all my data" keeps everything when the user cancels', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    useTransferStore.setState({ transfers: [makeTransfer()] })
    renderPage(<Settings />)

    await user.click(screen.getByRole('button', { name: /delete all my data/i }))

    expect(useTransferStore.getState().transfers).toHaveLength(1)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  test('"load demo data" replaces the data only after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    renderPage(<Settings />)
    const load = screen.getByRole('button', { name: /demo data/i })

    await user.click(load)
    expect(useTransferStore.getState().transfers).toEqual([])

    await user.click(load)
    expect(useTransferStore.getState().transfers.length).toBeGreaterThan(0)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  test('warns that data on this device is readable by anyone using the browser', () => {
    renderPage(<Settings />)
    expect(screen.getByTestId('shared-device-warning')).toHaveTextContent(/anyone who uses this browser/i)
  })
})

describe('Layout', () => {
  test('scrolls to the top when the page changes', async () => {
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/transactions']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/transactions" element={<p>tx</p>} />
            <Route path="/settings" element={<p>settings</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    scroll.mockClear()

    const [topNav] = screen.getAllByRole('navigation', { name: 'Main' })
    await user.click(within(topNav).getByRole('link', { name: /settings/i }))

    expect(scroll).toHaveBeenCalledWith(0, 0)
    expect(screen.getByText('settings')).toBeInTheDocument()
  })
})
