import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cleanText, isCommitment, sanitizedMerge, readLatest } from '../utils/validate'

// XAF has no subunit: whole francs only, 1 to 999,999,999,999.
const WHOLE_XAF = /^\d{1,12}$/

/** Planned recurring family support, in XAF per month (e.g. school fees). */
export const useCommitmentStore = create(
  persist(
    (set, get, api) => ({
      commitments: [],

      addCommitment: ({ label, monthlyXaf }) => {
        const raw = typeof monthlyXaf === 'number' ? String(monthlyXaf) : typeof monthlyXaf === 'string' ? monthlyXaf.trim() : ''
        const name = cleanText(label)
        if (!name) return { ok: false, error: 'Give the commitment a name.' }
        // Check the value that is stored: '0.4' used to pass "> 0" and then be saved as 0 XAF.
        if (!WHOLE_XAF.test(raw) || Number(raw) < 1) return { ok: false, error: 'Enter a monthly amount greater than 0 XAF.' }

        const commitment = { id: crypto.randomUUID(), label: name, monthlyXaf: Number(raw) }
        readLatest(api) // pick up anything another tab saved since this tab loaded
        set((state) => ({ commitments: [...state.commitments, commitment] }))
        return { ok: true, commitment }
      },

      removeCommitment: (id) => {
        readLatest(api)
        set((state) => ({ commitments: state.commitments.filter((c) => c.id !== id) }))
      },

      clearCommitments: () => set({ commitments: [] }),
    }),
    { name: 'nkap-commitments', version: 1, merge: sanitizedMerge('commitments', isCommitment) },
  ),
)
