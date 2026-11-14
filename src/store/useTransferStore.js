import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { parseAmount, transferResult } from '../utils/currency'
import { SERVICES } from '../utils/services'
import { validDate, cleanText, isTransfer, sanitizedMerge, readLatest } from '../utils/validate'

/**
 * Money sent home. Each transfer stores what was sent (EUR), the fee (EUR),
 * and the computed amount received (XAF) and cost (%), so history never
 * changes if the calculation rules change later.
 */
export const useTransferStore = create(
  persist(
    (set, get, api) => ({
      transfers: [],

      /** Returns { ok: true, transfer } or { ok: false, error } */
      addTransfer: ({ amount, fee, service, recipient, date }) => {
        const result = transferResult(amount, fee)
        if (!result.valid) return { ok: false, error: result.error }
        const name = cleanText(recipient)
        if (!name) return { ok: false, error: 'Enter who received the money.' }
        if (!SERVICES.includes(service)) return { ok: false, error: 'Choose a service.' }
        if (!validDate(date)) return { ok: false, error: 'Choose the date of the transfer (today or earlier).' }

        const transfer = {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          amount: parseAmount(amount),
          fee: parseAmount(fee),
          service,
          recipient: name,
          date,
          received: result.received,
          cost: result.cost,
        }
        readLatest(api) // pick up anything another tab saved since this tab loaded
        set((state) => ({ transfers: [transfer, ...state.transfers] }))
        return { ok: true, transfer }
      },

      removeTransfer: (id) => {
        readLatest(api)
        set((state) => ({ transfers: state.transfers.filter((t) => t.id !== id) }))
      },

      clearTransfers: () => set({ transfers: [] }),
    }),
    { name: 'nkap-transfers', version: 1, merge: sanitizedMerge('transfers', isTransfer) },
  ),
)
