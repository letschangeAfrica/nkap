import { useCallback, useEffect, useState } from 'react'
import { fetchEurRates, readCachedRates, writeCachedRates } from '../utils/rates'

/**
 * Live exchange rates with a fallback.
 * status: 'loading' | 'live' | 'cached' (last saved rates) | 'offline' (EUR/XAF only)
 */
export function useRates() {
  const [state, setState] = useState(() => {
    const cached = readCachedRates()
    return { status: 'loading', rates: cached?.rates ?? {}, date: cached?.date ?? null }
  })

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }))
    try {
      const fresh = await fetchEurRates()
      writeCachedRates(fresh)
      setState({ status: 'live', rates: fresh.rates, date: fresh.date })
    } catch {
      const cached = readCachedRates()
      setState(
        cached
          ? { status: 'cached', rates: cached.rates, date: cached.date }
          : { status: 'offline', rates: {}, date: null },
      )
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, retry: load }
}
