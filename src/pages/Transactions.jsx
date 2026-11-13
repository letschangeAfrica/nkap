import { useMemo } from 'react'
import { useTransactionStore } from '../store/useTransactionStore'
import { formatEur } from '../utils/currency'
import { currentMonthKey, formatMonth } from '../utils/dates'
import { transactionTotals } from '../utils/stats'
import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'
import { t } from '../i18n'

function Transactions() {
  const transactions = useTransactionStore((state) => state.transactions)
  const month = currentMonthKey()
  const totals = useMemo(() => transactionTotals(transactions, month), [transactions, month])

  const tiles = [
    { label: t('totals.income'), value: formatEur(totals.income), tone: 'text-received' },
    { label: t('totals.expenses'), value: formatEur(totals.expenses), tone: 'text-ink' },
    { label: t('totals.balance'), value: formatEur(totals.balance), tone: totals.balance < 0 ? 'text-fee' : 'text-ink' },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t('nav.transactions')}</h1>
        <p className="mt-2 text-muted">{t('transactions.lead', { month: formatMonth(month) })}</p>
      </header>

      <section
        aria-label={t('common.totalsFor', { month: formatMonth(month) })}
        className="grid grid-cols-1 divide-y divide-indigo-100 rounded-lg border border-indigo-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        {tiles.map((tile) => (
          <div key={tile.label} className="flex items-baseline justify-between gap-3 p-4 sm:block md:p-5">
            <p className="text-sm text-muted">{tile.label}</p>
            <p className={`font-mono text-lg font-semibold sm:mt-1.5 md:text-2xl ${tile.tone}`}>{tile.value}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:sticky lg:top-6 lg:col-span-5"><TransactionForm /></div>
        <div className="lg:col-span-7"><TransactionList /></div>
      </div>
    </div>
  )
}

export default Transactions
