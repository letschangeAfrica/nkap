// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Converter from '../pages/Converter'
import en from '../i18n/en'
import { startsWith } from './helpers/fixtures'

const liveResponse = { amount: 1, base: 'EUR', date: '2026-11-12', rates: { USD: 1.1, GBP: 0.85, CAD: 1.5, CHF: 0.95, CNY: 7.8 } }
const ok = (body) => ({ ok: true, json: async () => body })
const LIVE = startsWith(en.converter.live)
const CACHED = startsWith(en.converter.cached)
const OFFLINE = startsWith(en.converter.offline)

beforeEach(() => localStorage.clear())

describe('Converter', () => {
  test('converts EUR to XAF with the fixed peg', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(liveResponse)))
    render(<Converter />)

    expect(await screen.findByText(LIVE)).toBeInTheDocument()
    expect(screen.getByTestId('result')).toHaveTextContent('65,596 XAF')
  })

  test('converts to other currencies with the live rates', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(liveResponse)))
    const user = userEvent.setup()
    render(<Converter />)
    await screen.findByText(LIVE)

    await user.selectOptions(screen.getByLabelText(/^to/i), 'USD')

    expect(screen.getByTestId('result')).toHaveTextContent('110.00 USD')
  })

  test('swap reverses the conversion', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(liveResponse)))
    const user = userEvent.setup()
    render(<Converter />)
    await screen.findByText(LIVE)

    await user.clear(screen.getByLabelText(/amount/i))
    await user.type(screen.getByLabelText(/amount/i), '655957')
    await user.click(screen.getByRole('button', { name: /swap currencies/i }))

    expect(screen.getByTestId('result')).toHaveTextContent('1,000.00 €')
  })

  test('quick amounts fill the field and an invalid amount is explained', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(liveResponse)))
    const user = userEvent.setup()
    render(<Converter />)
    await screen.findByText(LIVE)

    await user.click(screen.getByRole('button', { name: '500' }))
    expect(screen.getByTestId('result')).toHaveTextContent('327,979 XAF')

    await user.clear(screen.getByLabelText(/amount/i))
    await user.type(screen.getByLabelText(/amount/i), '1e5')
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByTestId('result')).toHaveTextContent('—')
  })

  test('falls back to the peg when the rate service is down and nothing is cached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const user = userEvent.setup()
    render(<Converter />)

    expect(await screen.findByText(OFFLINE)).toBeInTheDocument()
    expect(screen.getByTestId('result')).toHaveTextContent('65,596 XAF')

    await user.selectOptions(screen.getByLabelText(/^to/i), 'USD')
    expect(screen.getByTestId('result')).toHaveTextContent('—')
    expect(screen.getByText(/no rate for usd/i)).toBeInTheDocument()
  })

  test('uses the last saved rates when the service is down', async () => {
    localStorage.setItem('nkap-rates', JSON.stringify({ date: '2026-11-10', rates: { USD: 1.2 } }))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    const user = userEvent.setup()
    render(<Converter />)

    expect(await screen.findByText(CACHED)).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText(/^to/i), 'USD')
    expect(screen.getByTestId('result')).toHaveTextContent('120.00 USD')
  })

  test('"Try again" recovers live rates after an outage and saves them', async () => {
    const fetch = vi.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(ok(liveResponse))
    vi.stubGlobal('fetch', fetch)
    const user = userEvent.setup()
    render(<Converter />)

    await user.click(await screen.findByRole('button', { name: en.converter.retry }))

    expect(await screen.findByText(LIVE)).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(JSON.parse(localStorage.getItem('nkap-rates')).rates.USD).toBe(1.1)
  })

  test('leaving the page cancels the request, and a late answer is ignored', async () => {
    let answerLate
    // a server that ignores the abort and answers anyway
    const fetch = vi.fn(() => new Promise((resolve) => { answerLate = () => resolve(ok(liveResponse)) }))
    vi.stubGlobal('fetch', fetch)
    const { unmount } = render(<Converter />)

    unmount()
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true)

    await act(async () => answerLate())
    expect(localStorage.getItem('nkap-rates')).toBeNull()
  })
})
