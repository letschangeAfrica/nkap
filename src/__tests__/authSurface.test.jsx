// @vitest-environment jsdom
// Locks in what the auth review found: no cookies, no tokens in storage, no redirect parameters.
import { describe, test, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { useTransferStore } from '../store/useTransferStore'
import { transferInput, useFixedDate } from './helpers/fixtures'

useFixedDate()

describe('no auth surface, no token storage, no open redirect', () => {
  beforeEach(() => localStorage.clear())

  test('the app never writes cookies or token-like keys to storage', () => {
    useTransferStore.getState().addTransfer(transferInput())
    render(<MemoryRouter initialEntries={['/dashboard']}><App /></MemoryRouter>)

    expect(document.cookie).toBe('')
    const keys = Object.keys(localStorage)
    expect(keys.length).toBeGreaterThan(0)
    expect(keys.every((k) => k.startsWith('nkap-'))).toBe(true)
    expect(keys.some((k) => /token|jwt|session|auth/i.test(k))).toBe(false)
  })

  test.each([
    '/?next=https://evil.example',
    '/settings?returnTo=//evil.example',
    '/dashboard?redirect=javascript:alert(1)',
  ])('ignores redirect parameters: %s', (entry) => {
    const before = window.location.href
    render(<MemoryRouter initialEntries={[entry]}><App /></MemoryRouter>)
    expect(window.location.href).toBe(before)
  })
})
