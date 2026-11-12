import { useTransactionStore } from '../store/useTransactionStore'
import { useTransferStore } from '../store/useTransferStore'
import { useCommitmentStore } from '../store/useCommitmentStore'
import { transferResult } from './currency'
import { lastMonths } from './stats'

/**
 * Six months of realistic example data ending in the current month.
 * The current month matches the Part 2 designs: income 1,250 €, my life 820 €,
 * 150 € sent home, 9.40 € in fees, 92,228 XAF received.
 */
export function buildDemoData(now = new Date()) {
  const months = lastMonths(6, now)
  const current = months[5]
  const today = now.getDate()
  // Keep current-month dates in the past so nothing is "in the future"
  const day = (key, d) => `${key}-${String(key === current ? Math.min(d, today) : d).padStart(2, '0')}`

  const lifeTotals = [760, 800, 905, 1020, 870]
  const homeTransfers = [
    { amount: 120, fee: 1.5, service: 'Wise', recipient: 'Maman, Douala' },
    { amount: 150, fee: 6.45, service: 'Orange Money', recipient: 'School fees' },
    { amount: 100, fee: 1.2, service: 'Wise', recipient: 'Maman, Douala' },
    { amount: 200, fee: 8.6, service: 'Orange Money', recipient: 'School fees' },
    { amount: 150, fee: 6.45, service: 'Orange Money', recipient: 'School fees' },
  ]

  let n = 0
  const id = () => `demo-${(n += 1)}`
  const transactions = []
  const transfers = []

  const tx = (type, amount, category, date, note = '') =>
    transactions.push({ id: id(), createdAt: n, type, amount, category, date, note })
  const tr = ({ amount, fee, service, recipient }, date) => {
    const r = transferResult(amount, fee)
    transfers.push({ id: id(), createdAt: n, amount, fee, service, recipient, date, received: r.received, cost: r.cost })
  }

  months.slice(0, 5).forEach((key, i) => {
    tx('income', 640, 'Salary', day(key, 1), 'Weekend job')
    tx('income', 610, 'Scholarship', day(key, 5))
    tx('expense', 450, 'Rent', day(key, 2))
    tx('expense', 88.8, 'Transport', day(key, 4), 'Navigo pass')
    tx('expense', Math.round((lifeTotals[i] - 450 - 88.8) * 100) / 100, 'Food', day(key, 15), 'Groceries')
    tr(homeTransfers[i], day(key, 14))
  })

  // Current month, as in the designs
  tx('income', 640, 'Salary', day(current, 1), 'Weekend job')
  tx('income', 610, 'Scholarship', day(current, 5))
  tx('expense', 450, 'Rent', day(current, 2))
  tx('expense', 88.8, 'Transport', day(current, 4), 'Navigo pass')
  tx('expense', 20, 'Phone & internet', day(current, 6))
  tx('expense', 133.6, 'Food', day(current, 8), 'Market')
  tx('expense', 46.8, 'Food', day(current, 10), 'Groceries')
  tx('expense', 80.8, 'Leisure', day(current, 11))
  tr({ amount: 50, fee: 8.2, service: 'Western Union', recipient: 'Papa, Bafoussam' }, day(current, 3))
  tr({ amount: 100, fee: 1.2, service: 'Wise', recipient: 'Maman, Douala' }, day(current, 12))

  const commitments = [{ id: id(), label: 'School fees and family support', monthlyXaf: 100000 }]
  return { transactions, transfers, commitments }
}

/** Replace everything with the demo data. */
export function loadDemoData(now = new Date()) {
  const { transactions, transfers, commitments } = buildDemoData(now)
  useTransactionStore.setState({ transactions })
  useTransferStore.setState({ transfers })
  useCommitmentStore.setState({ commitments })
}

/** Delete all of the user's data from the device. */
export function clearAllData() {
  useTransactionStore.getState().clearTransactions()
  useTransferStore.getState().clearTransfers()
  useCommitmentStore.getState().clearCommitments()
}
