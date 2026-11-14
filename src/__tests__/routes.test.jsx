// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import en from '../i18n/en'
import { setWelcomeDone } from '../utils/welcome'

const renderAt = (path) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)

beforeEach(() => {
  localStorage.clear()
  setWelcomeDone()
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline in tests')))
})

describe('routes', () => {
  test.each([
    ['/transactions', en.nav.transactions],
    ['/sent-home', en.nav.sentHome],
    ['/converter', en.nav.converter],
    ['/settings', en.nav.settings],
  ])('%s renders its page inside the app layout', async (path, title) => {
    renderAt(path)
    expect(screen.getAllByRole('navigation', { name: en.nav.main })).not.toHaveLength(0)
    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument()
  })

  test('/dashboard renders inside the app layout', () => {
    renderAt('/dashboard')
    expect(screen.getAllByRole('navigation', { name: en.nav.main })).not.toHaveLength(0)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  test('/ is the landing page, without the app navigation', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(en.landing.title)
    // the landing has its own top bar; the app's page links (e.g. Settings) are not on it
    expect(screen.queryByRole('link', { name: en.nav.settings })).not.toBeInTheDocument()
  })

  test('unknown paths show the 404 page with a way back', () => {
    renderAt('/does-not-exist')
    expect(screen.getByRole('heading', { level: 1, name: en.notFound.title })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: en.notFound.back })).toHaveAttribute('href', '/dashboard')
  })
})
