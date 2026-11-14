// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { commitmentProgress } from '../utils/stats'
import { buildInsights } from '../utils/insights'
import { isTransfer } from '../utils/validate'
import { useTransferStore } from '../store/useTransferStore'
import { useCommitmentStore } from '../store/useCommitmentStore'
import { useTransactionStore } from '../store/useTransactionStore'
import { loadDemoData } from '../utils/demoData'
import SentHome from '../pages/SentHome'
import Dashboard from '../pages/Dashboard'
import { useFixedDate } from './helpers/fixtures'

useFixedDate() // 12 Nov 2026

const school = { id: 'c-school', label: 'School fees', monthlyXaf: 50000 }
const mum = { id: 'c-mum', label: 'Maman', monthlyXaf: 60000 }
const tr = (received, date, commitmentId = null) => ({ id: `${received}-${date}`, amount: 100, fee: 1, received, cost: 1, date, service: 'Wise', recipient: 'x', commitmentId })

beforeEach(() => {
  localStorage.clear()
  useTransferStore.setState({ transfers: [] })
  useTransactionStore.setState({ transactions: [] })
  useCommitmentStore.setState({ commitments: [] })
})

describe('commitmentProgress', () => {
  test('per commitment: sent, left to send and over plan; unlinked counts as other', () => {
    const p = commitmentProgress([school, mum], [
      tr(30000, '2026-11-02', 'c-school'),
      tr(64809, '2026-11-05', 'c-mum'),
      tr(27419, '2026-11-06'),
      tr(5000, '2026-11-07', 'c-deleted'),
      tr(99999, '2026-10-28', 'c-school'), // last month: ignored
    ], '2026-11')
    expect(p.rows).toEqual([
      { id: 'c-school', label: 'School fees', planned: 50000, sent: 30000, remaining: 20000, over: 0 },
      { id: 'c-mum', label: 'Maman', planned: 60000, sent: 64809, remaining: 0, over: 4809 },
    ])
    expect(p.other).toBe(32419)
    expect(p).toMatchObject({ planned: 110000, sent: 94809 })
  })
})

describe('plan insights', () => {
  test('says when a commitment went over plan', () => {
    const texts = buildInsights({ transactions: [], transfers: [tr(64809, '2026-11-05', 'c-mum')], month: '2026-11', commitments: [mum] }).map((i) => i.text)
    expect(texts).toContain('You sent 4,809 XAF more than planned for Maman.')
  })

  test('from the 20th, says what is still to send', () => {
    const args = { transactions: [], transfers: [tr(30000, '2026-11-02', 'c-school')], month: '2026-11', commitments: [school] }
    expect(buildInsights({ ...args, today: new Date(2026, 10, 12) }).map((i) => i.id)).not.toContain('behind')
    expect(buildInsights({ ...args, today: new Date(2026, 10, 24) }).find((i) => i.id === 'behind').text)
      .toBe('20,000 XAF of your family plan is still to send this month.')
  })
})

describe('linking a transfer', () => {
  test('only an existing commitment is stored; old saved transfers without a link stay valid', () => {
    useCommitmentStore.setState({ commitments: [school] })
    const base = { amount: 100, fee: 1, service: 'Wise', recipient: 'Maman', date: '2026-11-01' }
    expect(useTransferStore.getState().addTransfer({ ...base, commitmentId: 'c-school' }).transfer.commitmentId).toBe('c-school')
    expect(useTransferStore.getState().addTransfer({ ...base, commitmentId: 'made-up' }).transfer.commitmentId).toBeNull()
    const { commitmentId, ...legacy } = tr(1000, '2026-11-01')
    expect(isTransfer(legacy)).toBe(true)
    expect(isTransfer({ ...legacy, commitmentId: 42 })).toBe(false)
  })

  test('the form offers the commitments and saves the link; the history shows it', async () => {
    useCommitmentStore.setState({ commitments: [school, mum] })
    const user = userEvent.setup()
    render(<SentHome />)
    await user.type(screen.getByLabelText(/amount sent/i), '100')
    await user.type(screen.getByLabelText(/^fee/i), '1')
    await user.type(screen.getByLabelText(/recipient/i), 'Lycée')
    await user.selectOptions(screen.getByLabelText(/counts towards/i), 'c-school')
    await user.click(screen.getByRole('button', { name: /save transfer/i }))
    expect(useTransferStore.getState().transfers[0].commitmentId).toBe('c-school')
    expect(screen.getAllByText('School fees').length).toBeGreaterThan(0)
  })

  test('without commitments, the form does not ask', () => {
    render(<SentHome />)
    expect(screen.queryByLabelText(/counts towards/i)).not.toBeInTheDocument()
  })
})

describe('dashboard family plan (demo data)', () => {
  test('one line per commitment with over plan, still to send, and other support', () => {
    loadDemoData()
    localStorage.setItem('nkap-welcome-done', '1')
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    const plan = screen.getByRole('heading', { name: /family plan/i }).closest('section')
    expect(within(plan).getByText('Support for Maman')).toBeInTheDocument()
    expect(within(plan).getByText('4,809 XAF over plan')).toBeInTheDocument()
    expect(within(plan).getByText('50,000 XAF still to send')).toBeInTheDocument()
    expect(within(plan).getByText('27,419 XAF')).toBeInTheDocument() // Papa: not in the plan
    expect(screen.getByText(/You sent 4,809\sXAF more than planned for Support for Maman\./)).toBeInTheDocument()
  })
})
