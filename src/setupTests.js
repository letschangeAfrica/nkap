import '@testing-library/jest-dom/vitest'
import { beforeEach, vi } from 'vitest'

// A React "not wrapped in act(...)" warning means a test asserted before the UI settled.
// Fail the test instead of letting the warnings pile up in the output.
const originalError = console.error
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation((message, ...rest) => {
    if (String(message).includes('not wrapped in act')) throw new Error(`React act() warning: ${message}`)
    originalError(message, ...rest)
  })
})
