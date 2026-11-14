// Runs Vitest from a cwd whose Windows drive letter is uppercase.
// Vitest fails every test file ("failed to find the runner") when started from
// a lowercase path like c:\..., which is VS Code's default terminal cwd.
// Vitest is started with Node directly, with no shell: arguments are passed as
// they are, never re-split or interpreted (V-02).
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const vitestBin = join(dirname(require.resolve('vitest/package.json')), 'vitest.mjs')

const cwd = process.platform === 'win32'
  ? process.cwd().replace(/^[a-z]:/, (d) => d.toUpperCase())
  : process.cwd()

const { status } = spawnSync(process.execPath, [vitestBin, ...process.argv.slice(2)], { cwd, stdio: 'inherit' })
process.exit(status ?? 1)
