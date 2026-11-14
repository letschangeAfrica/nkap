// @vitest-environment jsdom
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { applyTheme, initTheme, resolveTheme, useThemeStore } from '../theme'
import ThemeToggle from '../components/ThemeToggle'
import Settings from '../pages/Settings'
import { stubMatchMedia } from './helpers/observer'

const systemDark = (dark) => stubMatchMedia({ 'prefers-color-scheme: dark': dark })

beforeEach(() => {
  localStorage.clear()
  useThemeStore.setState({ theme: 'system' })
  delete document.documentElement.dataset.theme
})

describe('theme', () => {
  test('"system" follows the device, explicit choices win', () => {
    systemDark(true)
    expect(resolveTheme('system')).toBe('dark')
    expect(resolveTheme('light')).toBe('light')
    systemDark(false)
    expect(resolveTheme('system')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
  })

  test('applyTheme sets <html data-theme>', () => {
    applyTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    applyTheme('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  test('initTheme applies the saved choice and follows the device while on "system"', () => {
    systemDark(true)
    initTheme()
    expect(document.documentElement.dataset.theme).toBe('dark')

    const [[, onChange]] = window.matchMedia.mock.results.at(-1).value.addEventListener.mock.calls
    systemDark(false)
    onChange()
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  test('ignores an unknown theme, whether saved or set', async () => {
    localStorage.setItem('nkap-theme', JSON.stringify({ state: { theme: 'neon' }, version: 0 }))
    await useThemeStore.persist.rehydrate()
    expect(useThemeStore.getState().theme).toBe('system')

    useThemeStore.getState().setTheme('neon')
    expect(useThemeStore.getState().theme).toBe('system')
  })

  test('the top-bar toggle switches and remembers the choice', async () => {
    systemDark(false)
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('button', { name: /switch to dark mode/i }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
    await useThemeStore.persist.rehydrate()
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  test('Settings offers System, Light and Dark', async () => {
    systemDark(true)
    const user = userEvent.setup()
    render(<MemoryRouter><Settings /></MemoryRouter>)
    expect(screen.getByLabelText('System')).toBeChecked()

    await user.click(screen.getByLabelText('Light'))

    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
