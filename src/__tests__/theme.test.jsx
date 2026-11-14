// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { applyTheme, resolveTheme, useThemeStore } from '../theme'
import ThemeToggle from '../components/ThemeToggle'
import Settings from '../pages/Settings'

const mockSystem = (dark) =>
  vi.spyOn(window, 'matchMedia').mockImplementation((q) => ({
    matches: q.includes('prefers-color-scheme: dark') ? dark : false,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))

beforeEach(() => {
  vi.restoreAllMocks()
  if (!window.matchMedia) window.matchMedia = () => ({ matches: false, addEventListener: () => {} })
  localStorage.clear()
  useThemeStore.setState({ theme: 'system' })
  delete document.documentElement.dataset.theme
})

describe('theme', () => {
  test('"system" follows the device, explicit choices win', () => {
    mockSystem(true)
    expect(resolveTheme('system')).toBe('dark')
    expect(resolveTheme('light')).toBe('light')
    mockSystem(false)
    expect(resolveTheme('system')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
  })

  test('applyTheme sets <html data-theme>', () => {
    applyTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    applyTheme('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  test('the top-bar toggle switches and remembers the choice', async () => {
    mockSystem(false)
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(screen.getByRole('button', { name: /switch to dark mode/i }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(JSON.parse(localStorage.getItem('nkap-theme')).state.theme).toBe('dark')
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
  })

  test('Settings offers System, Light and Dark', async () => {
    mockSystem(true)
    const user = userEvent.setup()
    render(<MemoryRouter><Settings /></MemoryRouter>)
    expect(screen.getByLabelText('System')).toBeChecked()
    await user.click(screen.getByLabelText('Light'))
    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
