// Guards on deployment and build configuration (node environment).
import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { assertNoPublicSecrets } from '../../vite.config.js'

describe('security headers (public/_headers)', () => {
  const headers = readFileSync('public/_headers', 'utf8')
  const csp = headers.match(/Content-Security-Policy: (.+)/)[1]

  test('the CSP stays strict', () => {
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("script-src 'self'")
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval/)
    expect(csp).toContain("connect-src 'self' https://api.frankfurter.dev")
    expect(csp).toContain("font-src 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
  })

  test('the other protective headers are present', () => {
    for (const h of ['X-Content-Type-Options: nosniff', 'Referrer-Policy: no-referrer', 'Strict-Transport-Security:']) {
      expect(headers).toContain(h)
    }
  })

  test('the page loads no third-party font or script hosts', () => {
    const html = readFileSync('index.html', 'utf8')
    expect(html).not.toMatch(/fonts\.googleapis|fonts\.gstatic|<script[^>]+src="https?:/)
  })
})

describe('public env variables (vite.config.js)', () => {
  test.each(['VITE_API_KEY', 'VITE_RATES_APIKEY', 'VITE_SECRET', 'VITE_AUTH_TOKEN', 'VITE_DB_PASSWORD', 'VITE_PRIVATE_URL'])(
    'refuses to build with %s',
    (name) => {
      expect(() => assertNoPublicSecrets({ [name]: 'x' })).toThrow(/refusing to build/i)
    },
  )

  test('allows harmless public settings', () => {
    expect(() => assertNoPublicSecrets({ VITE_RATES_URL: 'https://example.org', VITE_APP_NAME: 'Nkap' })).not.toThrow()
  })
})
