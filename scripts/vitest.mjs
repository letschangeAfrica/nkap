// Runs Vitest from a cwd whose Windows drive letter is uppercase.
// Vitest fails every test file ("failed to find the runner") when started from
// a lowercase path like c:\..., which is VS Code's default terminal cwd.
import { spawnSync } from 'node:child_process'

const cwd = process.platform === 'win32'
  ? process.cwd().replace(/^[a-z]:/, (d) => d.toUpperCase())
  : process.cwd()

const { status } = spawnSync('npx', ['vitest', ...process.argv.slice(2)], { cwd, stdio: 'inherit', shell: true })
process.exit(status ?? 1)
