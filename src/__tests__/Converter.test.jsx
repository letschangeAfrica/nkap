// @vitest-environment jsdom
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Converter from '../pages/Converter'

const liveResponse = { amount: 1, base: 'EUR', date: '2026-11-12', rates: { USD: 1.1, GBP: 0.85, CAD: 1.5, CHF: 0.95, CNY: 7.8 } }

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

describe('Converter', () => {
  test('converts EUR to XAF with the peg and other currencies with live rates', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => liveResponse }))
    const user = userEvent.setup()
    render(<Converter />)

    expect(await screen.findByText(/ECB reference rates of/i)).toBeInTheDocument()
    expect(screen.getByTestId('result')).toHaveTextContent('65,596 XAF')

    await user.selectOptions(screen.getByLabelText(/^to/i), 'USD')
    expect(screen.getByTestId('result')).toHaveTextContent('110.00 USD')
  })

  test('swap reverses the conversion', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => liveResponse }))
    const user = userEvent.setup()
    render(<Converter />)
    await screen.findByText(/ECB reference rates of/i)
    await user.clear(screen.getByLabelText(/amount/i))
    await user.type(screen.getByLabelText(/amount/i), '655957')
    await user.click(screen.getByRole('button', { name: /swap currencies/i }))
    expect(screen.getByTestId('result')).toHaveTextContent('1,000.00 €')
  })

  test('falls back to the peg when the rate service is down and nothing is cached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const user = userEvent.setup()
    render(<Converter />)

    expect(await screen.findByText(/EUR ⇄ XAF still works/i)).toBeInTheDocument()
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

    expect(await screen.findByText(/last saved rates/i)).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText(/^to/i), 'USD')
    expect(screen.getByTestId('result')).toHaveTextContent('120.00 USD')
  })
})
