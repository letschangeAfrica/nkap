// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { csvCell, toCsv, makeBackup, parseBackup } from '../utils/backup'
import { buildDemoData, clearAllData } from '../utils/demoData'
import { useTransactionStore } from '../store/useTransactionStore'
import { useTransferStore } from '../store/useTransferStore'
import { useCommitmentStore } from '../store/useCommitmentStore'
import Settings from '../pages/Settings'
import { useFixedDate } from './helpers/fixtures'

useFixedDate() // 12 Nov 2026
const demo = () => buildDemoData(new Date(2026, 10, 12))

beforeEach(() => {
  localStorage.clear()
  clearAllData()
  vi.restoreAllMocks()
})

describe('CSV', () => {
  test('quotes separators and neutralises spreadsheet formulas', () => {
    expect(csvCell('Maman, Douala')).toBe('"Maman, Douala"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('=HYPERLINK("http://x")')).toBe(`"'=HYPERLINK(""http://x"")"`)
    expect(csvCell('+33 6')).toBe("'+33 6")
    expect(csvCell('@SUM(A1)')).toBe("'@SUM(A1)")
    expect(csvCell(-12.5)).toBe('-12.5') // numbers stay numbers
  })

  test('one sheet with transactions and transfers, newest first, with the commitment name', () => {
    const csv = toCsv(demo())
    const lines = csv.replace('﻿', '').trim().split('\r\n')
    expect(lines[0]).toBe('kind,date,amount_eur,fee_eur,received_xaf,cost_percent,category_or_service,note_or_recipient,commitment')
    expect(lines).toHaveLength(1 + 33 + 7)
    expect(lines[1].split(',')[1]).toBe('2026-11-12')
    expect(lines).toContain('transfer,2026-11-12,100,1.2,64809,1.2,Wise,"Maman, Douala",Support for Maman')
  })
})

describe('backup file', () => {
  test('round trip keeps every record', () => {
    const data = demo()
    const result = parseBackup(JSON.stringify(makeBackup(data)))
    expect(result).toMatchObject({ ok: true, skipped: 0 })
    expect(result.data).toEqual(data)
  })

  test('rejects other files, and newer backups', () => {
    expect(parseBackup('not json').error).toBe('notBackup')
    expect(parseBackup('{"app":"other","version":1}').error).toBe('notBackup')
    expect(parseBackup(JSON.stringify({ app: 'nkap', version: 99 })).error).toBe('newer')
    expect(parseBackup('x'.repeat(5 * 1024 * 1024 + 1)).error).toBe('tooBig')
  })

  test('skips invalid or duplicate records, drops unknown fields and dangling commitment links', () => {
    const good = { id: 't1', amount: 100, fee: 1, service: 'Wise', recipient: 'A', date: '2026-11-01', received: 64940, cost: 1, commitmentId: 'gone', extra: 'x' }
    const file = JSON.stringify({ app: 'nkap', version: 1, transfers: [good, good, { id: 't2', amount: -5 }, null], transactions: 'nope', commitments: [] })
    const r = parseBackup(file)
    expect(r.skipped).toBe(3)
    expect(r.data.transfers).toEqual([{ ...good, commitmentId: null, extra: undefined }].map(({ extra, ...t }) => t))
    expect(r.data.transactions).toEqual([])
  })
})

describe('Settings', () => {
  test('save, then restore a backup after confirmation', async () => {
    const data = demo()
    useTransactionStore.setState({ transactions: data.transactions })
    useTransferStore.setState({ transfers: data.transfers })
    useCommitmentStore.setState({ commitments: data.commitments })
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const user = userEvent.setup()
    render(<MemoryRouter><Settings /></MemoryRouter>)

    expect(screen.getByTestId('last-backup')).toHaveTextContent(/no backup saved yet\. save one now/i)
    await user.click(screen.getByRole('button', { name: /save a backup file/i }))
    expect(click).toHaveBeenCalled()
    expect(screen.getByTestId('last-backup')).toHaveTextContent('Last backup: 12 Nov 2026.')

    // wipe, then restore
    useTransactionStore.setState({ transactions: [] })
    useTransferStore.setState({ transfers: [] })
    useCommitmentStore.setState({ commitments: [] })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const file = new File([JSON.stringify(makeBackup(data))], 'nkap-backup.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText(/restore from a backup/i, { selector: 'input' }), file)
    expect(await screen.findByText(/backup restored: 33 transactions, 7 transfers, 2 commitments\./i)).toBeInTheDocument()
    expect(useTransferStore.getState().transfers).toHaveLength(7)
  })

  test('a wrong file is refused with a clear message', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Settings /></MemoryRouter>)
    await user.upload(screen.getByLabelText(/restore from a backup/i, { selector: 'input' }), new File(['hello'], 'notes.json', { type: 'application/json' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('This file is not a Nkap backup.')
  })
})
