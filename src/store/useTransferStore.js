import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { parseAmount, transferResult } from '../utils/currency'
import { SERVICES } from '../utils/services'
import { useCommitmentStore } from './useCommitmentStore'
import { validDate, cleanText, isTransfer, sanitizedMerge, readLatest } from '../utils/validate'

const MISSING = 'This entry no longer exists.'

/** Validate form fields; returns { ok: true, fields } or { ok: false, error }. */
function checkTransfer({ amount, fee, service, recipient, date, commitmentId = null }) {
  const result = transferResult(amount, fee)
  if (!result.valid) return { ok: false, error: result.error }
  const name = cleanText(recipient)
  if (!name) return { ok: false, error: 'Enter who received the money.' }
  if (!SERVICES.includes(service)) return { ok: false, error: 'Choose a service.' }
  if (!validDate(date)) return { ok: false, error: 'Choose the date of the transfer (today or earlier).' }
  // A transfer can count towards one family commitment; an unknown id is dropped, never stored
  const linked = typeof commitmentId === 'string' && useCommitmentStore.getState().commitments.some((c) => c.id === commitmentId)
  return {
    ok: true,
    fields: {
      amount: parseAmount(amount), fee: parseAmount(fee), service, recipient: name, date,
      received: result.received, cost: result.cost, commitmentId: linked ? commitmentId : null,
    },
  }
}

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
      addTransfer: (input) => {
        const check = checkTransfer(input)
        if (!check.ok) return check
        const transfer = { id: crypto.randomUUID(), createdAt: Date.now(), ...check.fields }
        readLatest(api) // pick up anything another tab saved since this tab loaded
        set((state) => ({ transfers: [transfer, ...state.transfers] }))
        return { ok: true, transfer }
      },

      /** Same checks as adding; recomputes what was received and the cost. Keeps id and creation time. */
      updateTransfer: (id, input) => {
        const check = checkTransfer(input)
        if (!check.ok) return check
        readLatest(api)
        const existing = get().transfers.find((t) => t.id === id)
        if (!existing) return { ok: false, error: MISSING }
        const transfer = { ...existing, ...check.fields }
        set((state) => ({ transfers: state.transfers.map((t) => (t.id === id ? transfer : t)) }))
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
