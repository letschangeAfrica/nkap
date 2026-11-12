import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { parseAmount, transferResult } from '../utils/currency'

/**
 * Money sent home. Each transfer stores what was sent (EUR), the fee (EUR),
 * and the computed amount received (XAF) and cost (%), so history never
 * changes if the calculation rules change later.
 */
export const useTransferStore = create(
  persist(
    (set) => ({
      transfers: [],

      /** Returns { ok: true, transfer } or { ok: false, error } */
      addTransfer: ({ amount, fee, service, recipient, date }) => {
        const result = transferResult(amount, fee)
        if (!result.valid) return { ok: false, error: result.error }
        if (!recipient || !recipient.trim()) return { ok: false, error: 'Enter who received the money.' }
        if (!date) return { ok: false, error: 'Choose the date of the transfer.' }

        const transfer = {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          amount: parseAmount(amount),
          fee: parseAmount(fee),
          service,
          recipient: recipient.trim(),
          date,
          received: result.received,
          cost: result.cost,
        }
        set((state) => ({ transfers: [transfer, ...state.transfers] }))
        return { ok: true, transfer }
      },

      removeTransfer: (id) => set((state) => ({ transfers: state.transfers.filter((t) => t.id !== id) })),

      clearTransfers: () => set({ transfers: [] }),
    }),
    { name: 'nkap-transfers', version: 1 },
  ),
)
