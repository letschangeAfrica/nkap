// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { buildServiceWorker, shellFiles, STATIC_SHELL } from '../../sw/buildServiceWorker.js'
import { initPwa } from '../pwa'
import InstallApp from '../components/InstallApp'
import OfflineBanner from '../components/OfflineBanner'

describe('manifest and icons', () => {
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'))
  test('installable: name, start page, standalone, a maskable icon, and every icon exists', () => {
    expect(manifest).toMatchObject({ short_name: 'Nkap', start_url: '/dashboard', display: 'standalone' })
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true)
    for (const icon of manifest.icons) expect(existsSync(`public${icon.src}`)).toBe(true)
    expect(existsSync('public/icons/apple-touch-icon.png')).toBe(true)
  })

  test('index.html links the manifest; sw.js is never cached by the CDN', () => {
    expect(readFileSync('index.html', 'utf8')).toContain('<link rel="manifest" href="/manifest.webmanifest" />')
    expect(readFileSync('public/_headers', 'utf8')).toMatch(/\/sw\.js\s+Cache-Control: no-cache/)
  })
})

describe('service worker', () => {
  test('precaches JS, CSS and Latin fonts only: no videos, no other alphabets', () => {
    const files = shellFiles([
      'assets/index-a1.js', 'assets/index-b2.css', 'assets/ibm-plex-sans-latin-400-normal-x.woff2',
      'assets/ibm-plex-sans-latin-ext-500-normal-y.woff2', 'assets/ibm-plex-sans-cyrillic-400-normal-z.woff2',
      'assets/ibm-plex-sans-latin-400-normal-x.woff', 'assets/demo-transfer-abc.mp4', 'index.html',
    ])
    expect(files).toEqual(['/assets/index-a1.js', '/assets/index-b2.css', '/assets/ibm-plex-sans-latin-400-normal-x.woff2', '/assets/ibm-plex-sans-latin-ext-500-normal-y.woff2'])
    expect(STATIC_SHELL).toContain('/')
  })

  test('the generated worker is versioned, leaves other sites and videos alone, and is valid JavaScript', () => {
    const code = buildServiceWorker({ version: '1.0.0-abc', precache: ['/', '/assets/index.js'] })
    expect(code).toContain('const VERSION = "1.0.0-abc"')
    expect(code).toContain("url.origin !== self.location.origin) return")
    expect(code).toContain(".mp4")
    expect(() => new Function(code)).not.toThrow()
  })
})

describe('install', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: () => {} }))
  })

  test('without a browser prompt, explains how to install', () => {
    render(<InstallApp />)
    expect(screen.getByTestId('install-action')).toHaveTextContent(/install app|add to home screen/i)
  })

  test("keeps the browser's install prompt for our button", async () => {
    initPwa({ register: false })
    const prompt = vi.fn().mockResolvedValue()
    const event = new Event('beforeinstallprompt', { cancelable: true })
    Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome: 'accepted' }) })
    const user = userEvent.setup()
    render(<InstallApp />)
    act(() => { window.dispatchEvent(event) })
    expect(event.defaultPrevented).toBe(true)
    await user.click(screen.getByRole('button', { name: /install the app/i }))
    expect(prompt).toHaveBeenCalled()
    expect(await screen.findByText(/installed on this device/i)).toBeInTheDocument()
  })
})

describe('offline banner', () => {
  test('appears when the connection drops and goes away when it returns', () => {
    render(<OfflineBanner />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    act(() => { window.dispatchEvent(new Event('offline')) })
    expect(screen.getByRole('status')).toHaveTextContent(/offline/i)
    act(() => { window.dispatchEvent(new Event('online')) })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})

describe('already installed', () => {
  beforeEach(() => {
    localStorage.clear()
    window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: () => {} }))
  })

  test('after the browser reports an install, the website says so instead of showing install steps', () => {
    initPwa({ register: false })
    act(() => { window.dispatchEvent(new Event('appinstalled')) })
    render(<InstallApp />)
    expect(screen.getByTestId('install-action')).toHaveTextContent('Nkap is installed. Open it from your home screen')
  })

  test('if the browser offers installation again (uninstalled), the install button comes back', () => {
    localStorage.setItem('nkap-installed', '1')
    initPwa({ register: false })
    render(<InstallApp />)
    const event = new Event('beforeinstallprompt', { cancelable: true })
    Object.assign(event, { prompt: vi.fn(), userChoice: Promise.resolve({ outcome: 'dismissed' }) })
    act(() => { window.dispatchEvent(event) })
    expect(screen.getByRole('button', { name: /install the app/i })).toBeInTheDocument()
    expect(localStorage.getItem('nkap-installed')).toBeNull()
  })

  test('the manifest has a fixed id equal to the previous start page', () => {
    const m = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'))
    expect(m.id).toBe('/dashboard')
  })
})
