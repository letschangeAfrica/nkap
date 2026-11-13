// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Transactions from '../pages/Transactions'
import Settings from '../pages/Settings'
import { clearAllData } from '../utils/demoData'
import { useTransactionStore } from '../store/useTransactionStore'

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
    expect(screen.getByLabelText(/key figures/i)).toBeInTheDocument()
    expect(screen.getAllByText(/92,228 XAF/).length).toBeGreaterThan(0)
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
    expect(useTransactionStore.getState().transactions).toHaveLength(1)
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
})

describe('Layout', () => {
  test('scrolls to the top when the page changes', async () => {
    const { default: Layout } = await import('../components/Layout')
    const { Routes, Route } = await import('react-router-dom')
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
    await user.click(screen.getAllByRole('link', { name: /settings/i })[0])
    expect(scroll).toHaveBeenCalledWith(0, 0)
  })
})
