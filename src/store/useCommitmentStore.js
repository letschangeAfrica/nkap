import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { parseAmount } from '../utils/currency'

/** Planned recurring family support, in XAF per month (e.g. school fees). */
export const useCommitmentStore = create(
  persist(
    (set) => ({
      commitments: [],

      addCommitment: ({ label, monthlyXaf }) => {
        const value = parseAmount(monthlyXaf)
        if (!label || !label.trim()) return { ok: false, error: 'Give the commitment a name.' }
        if (!Number.isFinite(value) || value <= 0) return { ok: false, error: 'Enter a monthly amount greater than 0 XAF.' }

        const commitment = { id: crypto.randomUUID(), label: label.trim(), monthlyXaf: Math.round(value) }
        set((state) => ({ commitments: [...state.commitments, commitment] }))
        return { ok: true, commitment }
      },

      removeCommitment: (id) => set((state) => ({ commitments: state.commitments.filter((c) => c.id !== id) })),

      clearCommitments: () => set({ commitments: [] }),
    }),
    { name: 'nkap-commitments', version: 1 },
  ),
)
