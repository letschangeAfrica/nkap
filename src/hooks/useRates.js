import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchEurRates, readCachedRates, writeCachedRates, isFresh } from '../utils/rates'

/**
 * Live exchange rates with a fallback.
 * status: 'loading' | 'live' | 'cached' (last saved rates) | 'offline' (EUR/XAF only)
 * Only one request runs at a time: a new load cancels the previous one, and a
 * cancelled request never updates the state.
 */
export function useRates() {
  const [state, setState] = useState(() => {
    const cached = readCachedRates()
    // Rates fetched in the last hour are used as they are: no request on every visit (I-05)
    if (isFresh(cached)) return { status: 'live', rates: cached.rates, date: cached.date }
    return { status: 'loading', rates: cached?.rates ?? {}, date: cached?.date ?? null }
  })
  const inFlight = useRef(null)

  const load = useCallback(async () => {
    inFlight.current?.abort()
    const ctrl = new AbortController()
    inFlight.current = ctrl
    setState((s) => ({ ...s, status: 'loading' }))
    try {
      const fresh = await fetchEurRates({ signal: ctrl.signal })
      if (ctrl.signal.aborted) return
      writeCachedRates({ ...fresh, fetchedAt: Date.now() })
      setState({ status: 'live', rates: fresh.rates, date: fresh.date })
    } catch {
      if (ctrl.signal.aborted) return
      const cached = readCachedRates()
      setState(
        cached
          ? { status: 'cached', rates: cached.rates, date: cached.date }
          : { status: 'offline', rates: {}, date: null },
      )
    }
  }, [])

  useEffect(() => {
    if (!isFresh(readCachedRates())) load()
    return () => inFlight.current?.abort()
  }, [load])

  return { ...state, retry: load }
}
