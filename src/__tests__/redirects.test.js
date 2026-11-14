import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

const appRoutes = [...read('src/App.jsx').matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((p) => p !== '/' && p !== '*')

const rules = read('public/_redirects')
  .split(/\r?\n/)
  .filter((l) => l.trim() && !l.trim().startsWith('#'))
  .map((l) => l.trim().split(/\s+/))

describe('public/_redirects (Netlify)', () => {
  test('every app page is served with 200', () => {
    expect(appRoutes.length).toBeGreaterThan(0)
    for (const route of appRoutes) {
      expect(rules).toContainEqual([route, '/index.html', '200'])
    }
  })

  test('no rule exists for a page the app does not have', () => {
    const pages = rules.filter(([from]) => from !== '/*').map(([from]) => from)
    expect(pages.sort()).toEqual([...appRoutes].sort())
  })

  test('everything else is a real 404, and that rule comes last', () => {
    expect(rules.at(-1)).toEqual(['/*', '/index.html', '404'])
    expect(rules.filter(([from]) => from === '/*')).toHaveLength(1)
  })
})
