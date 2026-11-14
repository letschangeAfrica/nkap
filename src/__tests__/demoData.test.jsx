// @vitest-environment jsdom
// Regression tests for authorization review Z-01: demo data must never silently replace real data.
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { loadDemoData, hasUserData } from '../utils/demoData'
import { useCommitmentStore } from '../store/useCommitmentStore'
import { useTransactionStore } from '../store/useTransactionStore'
import { useTransferStore } from '../store/useTransferStore'

const realLabels = () => useCommitmentStore.getState().commitments.map((c) => c.label)

beforeEach(() => {
  localStorage.clear()
  useTransactionStore.setState({ transactions: [] })
  useTransferStore.setState({ transfers: [] })
  useCommitmentStore.setState({ commitments: [] })
})

describe('loadDemoData', () => {
  test('loads into an empty device', () => {
    expect(hasUserData()).toBe(false)
    expect(loadDemoData()).toBe(true)
    expect(useTransferStore.getState().transfers.length).toBeGreaterThan(0)
  })

  test.each([
    ['a commitment', () => useCommitmentStore.getState().addCommitment({ label: 'Real', monthlyXaf: '5000' })],
    ['a transaction', () => useTransactionStore.getState().addTransaction({ type: 'expense', amount: '10', category: 'Rent', date: '2026-01-10' })],
    ['a transfer', () => useTransferStore.getState().addTransfer({ amount: '100', fee: '1', service: 'Wise', recipient: 'Maman', date: '2026-01-10' })],
  ])('refuses to overwrite %s without overwrite: true', (_, seed) => {
    seed()
    const before = JSON.stringify([useTransactionStore.getState().transactions, useTransferStore.getState().transfers, useCommitmentStore.getState().commitments])
    expect(loadDemoData()).toBe(false)
    const after = JSON.stringify([useTransactionStore.getState().transactions, useTransferStore.getState().transfers, useCommitmentStore.getState().commitments])
    expect(after).toBe(before)
  })

  test('overwrites when the caller explicitly allows it', () => {
    useCommitmentStore.getState().addCommitment({ label: 'Real', monthlyXaf: '5000' })
    expect(loadDemoData(undefined, { overwrite: true })).toBe(true)
    expect(realLabels()).not.toContain('Real')
  })
})

describe('Dashboard with only a commitment saved', () => {
  test('offers no demo button, and the real commitment survives', () => {
    localStorage.setItem('nkap-welcome-done', '1')
    useCommitmentStore.getState().addCommitment({ label: 'My real school fees', monthlyXaf: '75000' })
    render(<MemoryRouter initialEntries={['/dashboard']}><App /></MemoryRouter>)
    expect(screen.queryAllByRole('button').filter((b) => /demo/i.test(b.textContent))).toEqual([])
    expect(realLabels()).toEqual(['My real school fees'])
  })
})

describe('Settings → Load demo data', () => {
  test('still replaces real data after the user confirms', async () => {
    useCommitmentStore.getState().addCommitment({ label: 'Real', monthlyXaf: '5000' })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<MemoryRouter initialEntries={['/settings']}><App /></MemoryRouter>)
    const demo = screen.getAllByRole('button').find((b) => /demo/i.test(b.textContent))
    await userEvent.click(demo)
    expect(window.confirm).toHaveBeenCalledOnce()
    expect(realLabels()).not.toContain('Real')
  })

  test('changes nothing when the user cancels', async () => {
    useCommitmentStore.getState().addCommitment({ label: 'Real', monthlyXaf: '5000' })
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<MemoryRouter initialEntries={['/settings']}><App /></MemoryRouter>)
    await userEvent.click(screen.getAllByRole('button').find((b) => /demo/i.test(b.textContent)))
    expect(realLabels()).toEqual(['Real'])
  })
})
