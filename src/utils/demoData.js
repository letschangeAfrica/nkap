import { useTransactionStore } from '../store/useTransactionStore'
import { useTransferStore } from '../store/useTransferStore'
import { useCommitmentStore } from '../store/useCommitmentStore'
import { transferResult } from './currency'
import { lastMonths } from './stats'
import { setWelcomeDone } from './welcome'
import { clearErrorLog } from './errorLog'
import { t } from '../i18n'

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
    { amount: 120, fee: 1.5, service: 'Wise', recipient: t('demo.mum') },
    { amount: 150, fee: 6.45, service: 'Orange Money', recipient: t('demo.school') },
    { amount: 100, fee: 1.2, service: 'Wise', recipient: t('demo.mum') },
    { amount: 200, fee: 8.6, service: 'Orange Money', recipient: t('demo.school') },
    { amount: 150, fee: 6.45, service: 'Orange Money', recipient: t('demo.school') },
  ]

  let n = 0
  const id = () => `demo-${(n += 1)}`
  const transactions = []
  const transfers = []
  // Two family commitments; Maman's support goes over plan this month, school fees are still to send
  const commitments = [
    { id: id(), label: t('demo.mumSupport'), monthlyXaf: 60000 },
    { id: id(), label: t('demo.school'), monthlyXaf: 50000 },
  ]
  const planFor = { [t('demo.mum')]: commitments[0].id, [t('demo.school')]: commitments[1].id }

  const tx = (type, amount, category, date, note = '') =>
    transactions.push({ id: id(), createdAt: n, type, amount, category, date, note })
  const tr = ({ amount, fee, service, recipient }, date) => {
    const r = transferResult(amount, fee)
    transfers.push({ id: id(), createdAt: n, amount, fee, service, recipient, date, received: r.received, cost: r.cost, commitmentId: planFor[recipient] ?? null })
  }

  months.slice(0, 5).forEach((key, i) => {
    tx('income', 640, 'Salary', day(key, 1), t('demo.job'))
    tx('income', 610, 'Scholarship', day(key, 5))
    tx('expense', 450, 'Rent', day(key, 2))
    tx('expense', 88.8, 'Transport', day(key, 4), t('demo.navigo'))
    tx('expense', Math.round((lifeTotals[i] - 450 - 88.8) * 100) / 100, 'Food', day(key, 15), t('demo.groceries'))
    tr(homeTransfers[i], day(key, 14))
  })

  // Current month, as in the designs
  tx('income', 640, 'Salary', day(current, 1), t('demo.job'))
  tx('income', 610, 'Scholarship', day(current, 5))
  tx('expense', 450, 'Rent', day(current, 2))
  tx('expense', 88.8, 'Transport', day(current, 4), t('demo.navigo'))
  tx('expense', 20, 'Phone & internet', day(current, 6))
  tx('expense', 133.6, 'Food', day(current, 8), t('demo.market'))
  tx('expense', 46.8, 'Food', day(current, 10), t('demo.groceries'))
  tx('expense', 80.8, 'Leisure', day(current, 11))
  tr({ amount: 50, fee: 8.2, service: 'Western Union', recipient: t('demo.dad') }, day(current, 3))
  tr({ amount: 100, fee: 1.2, service: 'Wise', recipient: t('demo.mum') }, day(current, 12))

  return { transactions, transfers, commitments }
}

/** True when the device holds any of the user's own data (transactions, transfers or commitments). */
export function hasUserData() {
  return (
    useTransactionStore.getState().transactions.length > 0 ||
    useTransferStore.getState().transfers.length > 0 ||
    useCommitmentStore.getState().commitments.length > 0
  )
}

/**
 * Replace everything with the demo data. Refuses to overwrite the user's own
 * data unless the caller has asked them first and passes `{ overwrite: true }`.
 * Returns true when the demo data was loaded.
 */
export function loadDemoData(now = new Date(), { overwrite = false } = {}) {
  if (!overwrite && hasUserData()) return false
  const { transactions, transfers, commitments } = buildDemoData(now)
  useTransactionStore.setState({ transactions })
  useTransferStore.setState({ transfers })
  useCommitmentStore.setState({ commitments })
  return true
}

/** Delete all of the user's data from the device. */
export function clearAllData() {
  useTransactionStore.getState().clearTransactions()
  useTransferStore.getState().clearTransfers()
  useCommitmentStore.getState().clearCommitments()
  setWelcomeDone(false)
  clearErrorLog() // "Delete all my data" means everything, the diagnostic log included
}
