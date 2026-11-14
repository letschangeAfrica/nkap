import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

// Anything prefixed VITE_ is copied into the public JS bundle. Refuse names that look like secrets:
// in a client-only app there is no private place to keep them.
const SECRET_NAME = /(SECRET|PASSWORD|PASSWD|PRIVATE|TOKEN|API_?KEY|JWT)/i

export function assertNoPublicSecrets(env) {
  const leaked = Object.keys(env).filter((k) => SECRET_NAME.test(k))
  if (leaked.length) {
    throw new Error(`Refusing to build: ${leaked.join(', ')} would be shipped to every visitor. Secrets don't belong in a client-only app.`)
  }
}

export default defineConfig(({ mode }) => {
  assertNoPublicSecrets(loadEnv(mode, process.cwd(), 'VITE_'))

  return {
    plugins: [react(), tailwindcss()],
    // App version for the local error log and diagnostic report (src/utils/errorLog.js)
    define: { __APP_VERSION__: JSON.stringify(version) },
    test: {
      environment: 'node',
      globals: true,
      setupFiles: './src/setupTests.js',
      include: ['src/**/*.test.{js,jsx}'],
      restoreMocks: true,
      unstubGlobals: true,
      unstubEnvs: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/__tests__/**', 'src/main.jsx', 'src/i18n/{en,fr,wes}.js', 'src/components/ndop/**'],
        reporter: ['text-summary', 'html', 'json-summary'],
      },
    },
  }
})
