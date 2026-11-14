import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { parseAmount } from '../utils/currency'
import { validDate, cleanText, isTransaction, sanitizedMerge, readLatest } from '../utils/validate'

export const CATEGORIES = {
  income: ['Salary', 'Scholarship', 'Freelance', 'Family help', 'Other income'],
  expense: ['Rent', 'Food', 'Transport', 'Phone & internet', 'Education', 'Health', 'Leisure', 'Other'],
}

/** Personal income and expenses in EUR (the "my life" side of the budget). */
export const useTransactionStore = create(
  persist(
    (set, get, api) => ({
      transactions: [],

      /** Returns { ok: true, transaction } or { ok: false, error } */
      addTransaction: ({ type, amount, category, date, note = '' }) => {
        const value = parseAmount(amount)
        if (type !== 'income' && type !== 'expense') return { ok: false, error: 'Choose income or expense.' }
        if (!Number.isFinite(value) || value <= 0) return { ok: false, error: 'Enter an amount greater than 0 €.' }
        if (!CATEGORIES[type].includes(category)) return { ok: false, error: 'Choose a category.' }
        if (!validDate(date)) return { ok: false, error: 'Choose a date (today or earlier).' }

        const transaction = {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          type,
          amount: Math.round(value * 100) / 100,
          category,
          date,
          note: cleanText(note, 80),
        }
        readLatest(api) // pick up anything another tab saved since this tab loaded
        set((state) => ({ transactions: [transaction, ...state.transactions] }))
        return { ok: true, transaction }
      },

      removeTransaction: (id) => {
        readLatest(api)
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }))
      },

      clearTransactions: () => set({ transactions: [] }),
    }),
    { name: 'nkap-transactions', version: 1, merge: sanitizedMerge('transactions', isTransaction) },
  ),
)
