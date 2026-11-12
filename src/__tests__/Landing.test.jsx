// @vitest-environment jsdom
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Landing from '../pages/Landing'
import { transferResult } from '../utils/currency'

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
    expect(screen.getByText('64,809 XAF')).toBeInTheDocument()
    for (const [fee, shown] of [[1.8, '97,213 XAF'], [6.45, '94,163 XAF'], [14.2, '89,079 XAF']]) {
      expect(transferResult(150, fee).received.toLocaleString('en-US') + ' XAF').toBe(shown)
      expect(screen.getByText(shown)).toBeInTheDocument()
    }
  })
})
