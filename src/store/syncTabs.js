import { useTransactionStore } from './useTransactionStore'
import { useTransferStore } from './useTransferStore'
import { useCommitmentStore } from './useCommitmentStore'

/** localStorage key → [store, name of the list it persists] */
const STORES = {
  'nkap-transactions': [useTransactionStore, 'transactions'],
  'nkap-transfers': [useTransferStore, 'transfers'],
  'nkap-commitments': [useCommitmentStore, 'commitments'],
}

function reload(key, removed) {
  const [store, list] = STORES[key]
  // A removed key means another tab deleted the data (e.g. the error screen's reset).
  // rehydrate() would keep this tab's copy, and the next save would write it back.
  if (removed) store.setState({ [list]: [] })
  else store.persist.rehydrate()
}

/**
 * Keep every open tab on the same data: when another tab saves, deletes or clears,
 * reload that store here (through the same validation as start-up). Without this,
 * a tab's next save overwrites everything saved elsewhere since it opened.
 * Call once at start-up. Returns a function that stops listening (for tests).
 */
export function syncStoresAcrossTabs() {
  if (typeof window === 'undefined') return () => {}
  const onStorage = (e) => {
    if (e.storageArea && e.storageArea !== window.localStorage) return
    if (e.key === null) {
      // localStorage.clear() in another tab
      Object.keys(STORES).forEach((key) => reload(key, true))
    } else if (STORES[e.key]) {
      reload(e.key, e.newValue === null)
    }
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}
