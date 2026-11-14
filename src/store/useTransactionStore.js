import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { parseAmount } from '../utils/currency'
import { validDate, cleanText, isTransaction, sanitizedMerge, readLatest } from '../utils/validate'

export const CATEGORIES = {
  income: ['Salary', 'Scholarship', 'Freelance', 'Family help', 'Other income'],
  expense: ['Rent', 'Food', 'Transport', 'Phone & internet', 'Education', 'Health', 'Leisure', 'Other'],
}

const MISSING = 'This entry no longer exists.'

/** Validate form fields; returns { ok: true, fields } or { ok: false, error }. */
function checkTransaction({ type, amount, category, date, note = '' }) {
  const value = parseAmount(amount)
  if (type !== 'income' && type !== 'expense') return { ok: false, error: 'Choose income or expense.' }
  if (!Number.isFinite(value) || value <= 0) return { ok: false, error: 'Enter an amount greater than 0 €.' }
  if (!CATEGORIES[type].includes(category)) return { ok: false, error: 'Choose a category.' }
  if (!validDate(date)) return { ok: false, error: 'Choose a date (today or earlier).' }
  return { ok: true, fields: { type, amount: Math.round(value * 100) / 100, category, date, note: cleanText(note, 80) } }
}

/** Personal income and expenses in EUR (the "my life" side of the budget). */
export const useTransactionStore = create(
  persist(
    (set, get, api) => ({
      transactions: [],

      /** Returns { ok: true, transaction } or { ok: false, error } */
      addTransaction: (input) => {
        const check = checkTransaction(input)
        if (!check.ok) return check
        const transaction = { id: crypto.randomUUID(), createdAt: Date.now(), ...check.fields }
        readLatest(api) // pick up anything another tab saved since this tab loaded
        set((state) => ({ transactions: [transaction, ...state.transactions] }))
        return { ok: true, transaction }
      },

      /** Same checks as adding; keeps the id and creation time. Returns { ok, transaction } or { ok: false, error } */
      updateTransaction: (id, input) => {
        const check = checkTransaction(input)
        if (!check.ok) return check
        readLatest(api)
        const existing = get().transactions.find((t) => t.id === id)
        if (!existing) return { ok: false, error: MISSING }
        const transaction = { ...existing, ...check.fields }
        set((state) => ({ transactions: state.transactions.map((t) => (t.id === id ? transaction : t)) }))
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
