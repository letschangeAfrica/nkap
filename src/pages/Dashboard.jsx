import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTransactionStore } from '../store/useTransactionStore'
import { useTransferStore } from '../store/useTransferStore'
import { useCommitmentStore } from '../store/useCommitmentStore'
import { formatEur, formatXaf } from '../utils/currency'
import { currentMonthKey, formatMonth } from '../utils/dates'
import { transactionTotals, transferTotals, monthlySeries, potentialSavings, sortByDateDesc } from '../utils/stats'
import { loadDemoData } from '../utils/demoData'
import KpiTile from '../components/KpiTile'
import MonthlyChart from '../components/MonthlyChart'
import FamilyPlan from '../components/FamilyPlan'
import RecentActivity from '../components/RecentActivity'
import CostBadge from '../components/CostBadge'
import EmptyState from '../components/EmptyState'
import Welcome from '../components/Welcome'
import WheelIllustration from '../components/ndop/WheelIllustration'
import { buildInsights } from '../utils/insights'
import { welcomeDone, setWelcomeDone } from '../utils/welcome'

const eur0 = (n) => `${Math.round(n).toLocaleString('en-US')} €`

function Dashboard() {
  const transactions = useTransactionStore((s) => s.transactions)
  const transfers = useTransferStore((s) => s.transfers)
  const commitments = useCommitmentStore((s) => s.commitments)

  const month = currentMonthKey()
  const monthName = formatMonth(month)

  const money = useMemo(() => transactionTotals(transactions, month), [transactions, month])
  const home = useMemo(() => transferTotals(transfers, month), [transfers, month])
  const series = useMemo(() => monthlySeries(transactions, transfers, 6), [transactions, transfers])
  const { cheapest, savings } = useMemo(() => potentialSavings(transfers, month), [transfers, month])
  const planned = commitments.reduce((sum, c) => sum + c.monthlyXaf, 0)

  const recent = useMemo(() => {
    const items = [
      ...transactions.map((t) => ({
        id: t.id, date: t.date, createdAt: t.createdAt,
        badge: t.type === 'income' ? 'IN' : t.category.slice(0, 2).toUpperCase(),
        title: t.note || t.category, meta: t.category,
        amount: t.type === 'income' ? t.amount : -t.amount,
      })),
      ...transfers.map((t) => ({
        id: t.id, date: t.date, createdAt: t.createdAt,
        badge: t.service.slice(0, 2).toUpperCase(),
        title: `Sent to ${t.recipient}`, meta: `${t.service} · ${formatXaf(t.received)}`,
        amount: -t.amount, cost: t.cost,
      })),
    ]
    return sortByDateDesc(items).slice(0, 5)
  }, [transactions, transfers])

  const isEmpty = transactions.length === 0 && transfers.length === 0
  const [showWelcome, setShowWelcome] = useState(() => !welcomeDone())
  const finishWelcome = () => {
    setWelcomeDone()
    setShowWelcome(false)
  }
  const insights = useMemo(() => buildInsights({ transactions, transfers, month }), [transactions, transfers, month])

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Your month at a glance</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">{monthName}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/transactions" className="rounded-md border border-indigo-600 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100">
            Add expense
          </Link>
          <Link to="/sent-home" className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800">
            Send home
          </Link>
        </div>
      </header>

      {isEmpty && showWelcome ? (
        <Welcome onDone={finishWelcome} onDemo={() => { finishWelcome(); loadDemoData() }} />
      ) : isEmpty ? (
        <section className="rounded-lg border border-indigo-100">
          <EmptyState
            title="Nothing recorded yet"
            action={
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <Link to="/sent-home" className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800">Record a transfer</Link>
                <button type="button" onClick={() => loadDemoData()} className="rounded-md border border-indigo-600 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100">
                  Explore with demo data
                </button>
              </div>
            }
          >
            Add your income, expenses and transfers home, or explore the app with example data first.
          </EmptyState>
        </section>
      ) : (
        <>
          <section aria-label="Key figures" className="grid grid-cols-2 divide-indigo-100 rounded-lg border border-indigo-100 lg:grid-cols-4 [&>*]:border-indigo-100 [&>*:nth-child(odd)]:border-r lg:[&>*]:border-r lg:[&>*:last-child]:border-r-0 [&>*:nth-child(-n+2)]:border-b lg:[&>*]:border-b-0">
            <KpiTile label="Income" value={money.income} format={eur0} hint="This month" />
            <KpiTile
              label="My life"
              value={money.expenses}
              format={eur0}
              hint={money.income > 0 ? `${Math.round((money.expenses / money.income) * 100)}% of income` : 'Expenses'}
            />
            <KpiTile label="Sent home" value={home.sent} format={eur0} hint={`↳ ${formatXaf(home.received)} received`} hintTone="text-received font-semibold" />
            <KpiTile label="Lost to fees" value={home.fees} format={formatEur} tone="text-fee" hint={home.sent > 0 ? `${home.cost}% of what you sent` : 'No transfers yet'} />
          </section>

          {insights.length > 0 && (
            <section aria-label="This month in a few words" className="flex items-start gap-4 rounded-lg bg-indigo-100/60 p-5">
              <WheelIllustration className="hidden h-12 w-12 shrink-0 sm:block" />
              <ul className="flex flex-col gap-1.5">
                {insights.map((insight) => (
                  <li key={insight.id} className="text-ink">{insight.text}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8"><MonthlyChart series={series} /></div>
            <aside className="flex flex-col gap-6 lg:col-span-4">
              <FamilyPlan planned={planned} received={home.received} monthName={monthName.split(' ')[0]} />
              {cheapest && (
                <section className="flex flex-col gap-2 rounded-lg border border-indigo-100 p-6">
                  <h2 className="font-display text-lg font-semibold">Cheapest service so far</h2>
                  <p className="flex items-baseline gap-3">
                    <span className="font-display text-2xl font-bold">{cheapest.service}</span>
                    <CostBadge cost={cheapest.cost} showLabel={false} />
                  </p>
                  <p className="text-sm text-muted">
                    {savings > 0
                      ? <>Using {cheapest.service} for every transfer this month would have cost about <span className="font-mono font-semibold text-ink">{formatEur(savings)}</span> less.</>
                      : 'Your transfers this month already used the cheapest option.'}
                  </p>
                </section>
              )}
            </aside>
          </div>

          <RecentActivity items={recent} />
        </>
      )}
    </div>
  )
}

export default Dashboard
