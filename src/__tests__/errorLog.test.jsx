// @vitest-environment jsdom
// Logging review L-01: a local, sanitized, user-shareable error log.
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ERROR_LOG_KEY, MAX_ENTRIES, APP_VERSION, sanitize, recordError, readErrorLog, clearErrorLog,
  diagnosticReport, installGlobalErrorLogging, reactRootErrorOptions,
} from '../utils/errorLog'
import { useTransferStore } from '../store/useTransferStore'
import { clearAllData } from '../utils/demoData'
import ErrorBoundary from '../components/ErrorBoundary'
import DiagnosticReport from '../components/DiagnosticReport'

beforeEach(() => {
  localStorage.clear()
  useTransferStore.setState({ transfers: [] })
})

describe('sanitize', () => {
  test('strips line breaks and control characters (no forged log lines)', () => {
    // newline, carriage return, U+2028 line separator and a bell character
    const input = 'line1' + String.fromCharCode(10) + 'line2' + String.fromCharCode(13, 0x2028, 7) + ' end'
    expect(sanitize(input)).toBe('line1 line2    end')
  })
  test('blanks quoted text, which may contain saved data', () => {
    expect(sanitize(`Unexpected token 'M', "Maman, Douala 150" is not valid JSON`)).toBe('Unexpected token "…", "…" is not valid JSON')
  })
  test('caps the length', () => {
    expect(sanitize('x'.repeat(1000))).toHaveLength(300)
  })
})

describe('recordError', () => {
  test('stores a fixed set of fields, nothing else', () => {
    recordError(new TypeError('boom'), 'test')
    const [entry] = readErrorLog()
    expect(Object.keys(entry).sort()).toEqual(['at', 'message', 'name', 'path', 'version', 'where'])
    expect(entry).toMatchObject({ name: 'TypeError', message: 'boom', where: 'test', version: APP_VERSION })
    expect(entry.at).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/)
  })

  test('keeps only the latest entries', () => {
    for (let i = 0; i < MAX_ENTRIES + 5; i++) recordError(new Error(`#${i}`))
    const log = readErrorLog()
    expect(log).toHaveLength(MAX_ENTRIES)
    expect(log.at(-1).message).toBe(`#${MAX_ENTRIES + 4}`)
  })

  test('handles non-Error values and never throws, even with broken storage', () => {
    recordError('plain string')
    recordError(undefined)
    expect(readErrorLog().map((e) => e.message)).toEqual(['plain string', ''])
    localStorage.setItem(ERROR_LOG_KEY, 'not json')
    expect(() => recordError(new Error('x'))).not.toThrow()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    expect(() => recordError(new Error('y'))).not.toThrow()
  })

  test('the app version comes from package.json at build time', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+/)
  })
})

describe('what gets recorded', () => {
  test('React errors (root options) are recorded and still printed', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    reactRootErrorOptions.onCaughtError(new Error('render failed'))
    reactRootErrorOptions.onRecoverableError(new Error('hydration'))
    expect(readErrorLog().map((e) => [e.where, e.message])).toEqual([['boundary', 'render failed'], ['recoverable', 'hydration']])
    expect(spy).toHaveBeenCalledOnce()
  })

  test('errors outside React (window error, unhandled promise) are recorded', () => {
    const stop = installGlobalErrorLogging()
    window.dispatchEvent(new ErrorEvent('error', { error: new RangeError('in a handler'), message: 'in a handler' }))
    const rejection = new Event('unhandledrejection')
    rejection.reason = new Error('in a promise')
    window.dispatchEvent(rejection)
    stop()
    expect(readErrorLog().map((e) => [e.where, e.name, e.message])).toEqual([
      ['window', 'RangeError', 'in a handler'],
      ['promise', 'Error', 'in a promise'],
    ])
  })

  test('saved records that fail validation are counted, never copied into the log', async () => {
    const good = { id: 'a', createdAt: 1, amount: 100, fee: 1, service: 'Wise', recipient: 'Maman', date: '2026-01-10', received: 64939, cost: 1 }
    localStorage.setItem('nkap-transfers', JSON.stringify({ state: { transfers: [good, { id: 'b', recipient: 'Secret name' }, {}] }, version: 1 }))
    await useTransferStore.persist.rehydrate()
    expect(useTransferStore.getState().transfers).toHaveLength(1)
    const [entry] = readErrorLog()
    expect(entry).toMatchObject({ where: 'rehydrate', message: '2 saved transfers could not be read and were skipped' })
    expect(JSON.stringify(readErrorLog())).not.toContain('Secret name')
  })
})

describe('retention', () => {
  test('"Delete all my data" also deletes the error log', () => {
    recordError(new Error('x'))
    clearAllData()
    expect(localStorage.getItem(ERROR_LOG_KEY)).toBeNull()
  })

  test('clearErrorLog empties it', () => {
    recordError(new Error('x'))
    clearErrorLog()
    expect(readErrorLog()).toEqual([])
  })
})

describe('diagnostic report', () => {
  test('is JSON with the app, version and errors only', () => {
    recordError(new Error('x'), 'test')
    const report = JSON.parse(diagnosticReport())
    expect(Object.keys(report).sort()).toEqual(['app', 'errors', 'generatedAt', 'version'])
    expect(report.errors).toHaveLength(1)
  })

  test('the button copies the report to the clipboard', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    recordError(new Error('copied error'))
    render(<DiagnosticReport />)
    await user.click(screen.getByRole('button', { name: /copy diagnostic report/i }))
    expect(writeText).toHaveBeenCalledOnce()
    expect(writeText.mock.calls[0][0]).toContain('copied error')
    expect(await screen.findByRole('status')).toHaveTextContent(/report copied/i)
  })

  test('falls back to a read-only box when the clipboard is unavailable', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))
    render(<DiagnosticReport />)
    await user.click(screen.getByRole('button', { name: /copy diagnostic report/i }))
    const box = await screen.findByRole('textbox')
    expect(box).toHaveAttribute('readonly')
    expect(JSON.parse(box.value).app).toBe('nkap')
  })

  test('the error screen offers the report, and Reset keeps the log', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    recordError(new Error('before reset'))
    const Boom = () => { throw new Error('crash') }
    render(<ErrorBoundary><Boom /></ErrorBoundary>)
    expect(screen.getByRole('button', { name: /copy diagnostic report/i })).toBeInTheDocument()
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, assign, pathname: '/' })
    await userEvent.click(screen.getByRole('button', { name: /reset data on this device/i }))
    expect(assign).toHaveBeenCalledWith('/')
    expect(readErrorLog().map((e) => e.message)).toContain('before reset')
  })
})
