// @vitest-environment jsdom
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Landing from '../pages/Landing'
import { transferResult } from '../utils/currency'
import { compareServices, exampleFee, EXAMPLE_SERVICES } from '../utils/exampleFees'

describe('Landing', () => {
  test('has one h1 and calls to action that open the app', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    for (const name of [/open the app/i, /get started/i, /start tracking/i]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', '/dashboard')
    }
    expect(screen.getByRole('link', { name: /see how it works/i })).toHaveAttribute('href', '#how')
  })

  test('example figures match the real calculation', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>)
    expect(transferResult(100, 1.2)).toMatchObject({ received: 64809, cost: 1.2 })
    expect(screen.getByTestId('hero-received')).toHaveTextContent('64,809 XAF')
    // "Why Nkap" card uses the same example fees as the hero calculator
    for (const r of compareServices(150).rows) {
      expect(screen.getAllByText(`${r.received.toLocaleString('en-US')} XAF`).length).toBeGreaterThan(0)
    }
  })
})

describe('Hero calculator', () => {
  test('example fees: 100 € with Wise costs 1.20 €, and Wise is the cheapest', () => {
    expect(exampleFee(100, EXAMPLE_SERVICES[0])).toBe(1.2)
    expect(compareServices(100).best.name).toBe('Wise')
  })

  test('changing the amount and the service updates what reaches home', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Landing /></MemoryRouter>)
    const input = screen.getByLabelText(/you send/i)
    await user.clear(input)
    await user.type(input, '200')
    const wise = transferResult(200, exampleFee(200, EXAMPLE_SERVICES[0])).received
    expect(screen.getByTestId('hero-received')).toHaveTextContent(`${wise.toLocaleString('en-US')} XAF`)

    await user.click(screen.getByLabelText('Western Union'))
    const wu = transferResult(200, exampleFee(200, EXAMPLE_SERVICES[2])).received
    expect(screen.getByTestId('hero-received')).toHaveTextContent(`${wu.toLocaleString('en-US')} XAF`)
    expect(screen.getByText(`+${(wise - wu).toLocaleString('en-US')} XAF`)).toBeInTheDocument()
  })

  test('explains an empty amount or a fee larger than the amount', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Landing /></MemoryRouter>)
    const input = screen.getByLabelText(/you send/i)
    await user.clear(input)
    expect(screen.getByText(/enter an amount/i)).toBeInTheDocument()
    await user.type(input, '3')
    await user.click(screen.getByLabelText('Western Union'))
    expect(screen.getByText(/example fee is larger/i)).toBeInTheDocument()
  })
})

describe('Reveal', () => {
  test('content stays visible when IntersectionObserver is unavailable', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>)
    expect(document.querySelectorAll('.nk-reveal')).toHaveLength(0)
    expect(screen.getByText(/two money worlds/i)).toBeVisible()
  })
})

describe('Remittance statistic', () => {
  test('shows the World Bank figure with a link to its source', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>)
    expect(screen.getByText('8.46%', { selector: '.sr-only' })).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /world bank, remittance prices worldwide/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('remittanceprices.worldbank.org'))
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })
})

describe('Demo video', () => {
  test('is silent, looped, lazy and described for screen readers', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>)
    const video = screen.getByLabelText(/demo: a 100 € transfer/i)
    expect(video.muted).toBe(true)
    expect(video).toHaveAttribute('loop')
    expect(video).toHaveAttribute('preload', 'none')
    expect(video.querySelector('source')).toHaveAttribute('type', 'video/mp4')
    expect(screen.getByRole('button', { name: /play the demo/i })).toBeInTheDocument()
  })
})
