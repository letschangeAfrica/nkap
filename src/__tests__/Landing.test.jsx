// @vitest-environment jsdom
import { describe, test, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Landing from '../pages/Landing'
import en from '../i18n/en'
import { stubIntersectionObserver, stubMatchMedia } from './helpers/observer'

const renderLanding = () => render(<MemoryRouter><Landing /></MemoryRouter>)

describe('Landing', () => {
  test('has one h1 and calls to action that open the app', () => {
    renderLanding()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(en.landing.title)
    for (const name of [/open the app/i, /get started/i, /start tracking/i]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', '/dashboard')
    }
    expect(screen.getByRole('link', { name: /see how it works/i })).toHaveAttribute('href', '#how')
  })

  test('"Why Nkap" shows what 150 € becomes with each example service', () => {
    renderLanding()
    // Fee models in utils/exampleFees.js, worked out by hand:
    // Wise 0.30 + 0.9 % = 1.65 € → 148.35 € → 97,311 XAF
    // Orange Money 4.3 % = 6.45 € → 143.55 € → 94,163 XAF
    // Western Union 4.90 + 3.5 % = 10.15 € → 139.85 € → 91,735 XAF
    for (const xaf of ['97,311 XAF', '94,163 XAF', '91,735 XAF']) {
      expect(screen.getAllByText(xaf)).not.toHaveLength(0)
    }
  })
})

describe('Hero calculator', () => {
  test('starts at 100 € with Wise', () => {
    renderLanding()
    // 100 € − 1.20 € = 98.80 € × 655.957 = 64,809 XAF
    expect(screen.getByTestId('hero-received')).toHaveTextContent('64,809 XAF')
  })

  test('changing the amount and the service updates what reaches home', async () => {
    const user = userEvent.setup()
    renderLanding()
    const input = screen.getByLabelText(/you send/i)

    await user.clear(input)
    await user.type(input, '200')
    // Wise: 0.30 + 0.9 % of 200 = 2.10 € → 197.90 € → 129,814 XAF
    expect(screen.getByTestId('hero-received')).toHaveTextContent('129,814 XAF')

    await user.click(screen.getByLabelText('Western Union'))
    // Western Union: 4.90 + 3.5 % of 200 = 11.90 € → 188.10 € → 123,386 XAF
    expect(screen.getByTestId('hero-received')).toHaveTextContent('123,386 XAF')
    expect(screen.getByText('+6,428 XAF')).toBeInTheDocument()
  })

  test('explains an empty amount or a fee larger than the amount', async () => {
    const user = userEvent.setup()
    renderLanding()
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
    renderLanding()
    expect(document.querySelectorAll('.nk-reveal')).toHaveLength(0)
    expect(screen.getByText(/two money worlds/i)).toBeVisible()
  })

  test('with IntersectionObserver, sections appear when they scroll into view', () => {
    stubMatchMedia({ 'prefers-reduced-motion': false })
    const observers = stubIntersectionObserver()
    // the demo video starts playing when visible; jsdom cannot play media
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    renderLanding()
    const sections = document.querySelectorAll('.nk-reveal')
    expect(sections.length).toBeGreaterThan(0)
    expect(document.querySelectorAll('.nk-reveal.is-shown')).toHaveLength(0)

    act(() => observers.forEach((o) => o.fire(true)))

    expect(document.querySelectorAll('.nk-reveal.is-shown')).toHaveLength(sections.length)
  })
})

describe('Remittance statistic', () => {
  test('shows the World Bank figure with a link to its source', () => {
    renderLanding()
    expect(screen.getByText('8.46%', { selector: '.sr-only' })).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /world bank, remittance prices worldwide/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('remittanceprices.worldbank.org'))
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })
})

describe('Demo video', () => {
  test('is silent, looped, lazy and described for screen readers', () => {
    renderLanding()
    const video = screen.getByLabelText(/demo: a 100 € transfer/i)
    expect(video.muted).toBe(true)
    expect(video).toHaveAttribute('loop')
    expect(video).toHaveAttribute('preload', 'none')
    expect(video.querySelector('source')).toHaveAttribute('type', 'video/mp4')
    expect(screen.getByRole('button', { name: /play the demo/i })).toBeInTheDocument()
  })
})
