import { readFileSync } from 'node:fs'

/** Headers of the "/*" block in public/_headers, for `vite preview` (production parity). */
export function siteHeaders(text = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8')) {
  const block = text.split(/\n(?=\S)/).find((b) => b.startsWith('/*'))
  return Object.fromEntries(
    (block ?? '').split('\n').slice(1).map((l) => l.trim()).filter((l) => l.includes(':'))
      // upgrade-insecure-requests would break the plain-http preview server
      .map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim().replace(/;\s*upgrade-insecure-requests/, '')])
      .filter(([name]) => name !== 'Strict-Transport-Security'),
  )
}
