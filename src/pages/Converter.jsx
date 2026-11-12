import { useMemo, useState } from 'react'
import { parseAmount } from '../utils/currency'
import { formatDate } from '../utils/dates'
import { CURRENCIES, convert, unitRate, hasRate, formatMoney, formatRate } from '../utils/rates'
import { useRates } from '../hooks/useRates'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import StitchLine from '../components/StitchLine'

const fieldClass =
  'mt-1.5 w-full rounded-md border border-[#B9C0DD] bg-white px-3.5 py-3 text-base text-ink focus:border-indigo-600'
const QUICK = [50, 100, 200, 500]

function RateStatus({ status, date, retry }) {
  if (status === 'loading') return <p role="status" className="text-sm text-muted">Loading today's rates…</p>
  if (status === 'live') return <p role="status" className="text-sm text-muted">ECB reference rates of {formatDate(date)}.</p>
  return (
    <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#E3C9A8] bg-[#FBF4EA] px-4 py-3 text-sm">
      <p>
        {status === 'cached'
          ? `Live rates are unavailable. Showing the last saved rates, from ${formatDate(date)}.`
          : 'Live rates are unavailable. EUR ⇄ XAF still works because it uses the fixed peg.'}
      </p>
      <button type="button" onClick={retry} className="font-semibold text-indigo-600 underline underline-offset-4">Try again</button>
    </div>
  )
}

function Converter() {
  const { status, rates, date, retry } = useRates()
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('XAF')

  const value = parseAmount(amount)
  const valid = Number.isFinite(value) && value >= 0
  const pegged = [from, to].every((c) => c === 'EUR' || c === 'XAF')
  const result = valid ? convert(value, from, to, rates) : null
  const shown = useAnimatedNumber(result ?? 0)
  const rate = unitRate(from, to, rates)
  const missing = [from, to].find((c) => !hasRate(c, rates))

  const table = useMemo(
    () => (valid ? CURRENCIES.filter((c) => c.code !== from).map((c) => ({ code: c.code, name: c.name, value: convert(value, from, c.code, rates) })) : []),
    [valid, value, from, rates],
  )

  const swap = () => { setFrom(to); setTo(from) }

  const select = (label, current, onChange) => (
    <label className="text-sm font-semibold">
      {label}
      <select className={fieldClass} value={current} onChange={(e) => onChange(e.target.value)}>
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} · {c.name}{hasRate(c.code, rates) ? '' : ' (unavailable)'}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Converter</h1>
        <p className="mt-2 text-muted">1 EUR = 655.957 XAF, always. Other currencies use live ECB rates.</p>
      </header>

      <RateStatus status={status} date={date} retry={retry} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <section className="flex flex-col gap-5 rounded-lg border border-indigo-100 p-6 md:p-7 lg:col-span-7">
          <label className="text-sm font-semibold">
            Amount
            <input
              className={`${fieldClass} font-mono text-lg`}
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(String(q))}
                className="rounded-full border border-indigo-100 px-3 py-1 font-mono text-sm hover:border-indigo-600"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
            {select('From', from, setFrom)}
            <button
              type="button"
              onClick={swap}
              aria-label="Swap currencies"
              className="mb-1 inline-flex h-11 w-11 items-center justify-self-center justify-center rounded-md border border-indigo-100 text-indigo-600 hover:bg-indigo-100"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 8 H18 L14 4 M20 16 H6 L10 20" />
              </svg>
            </button>
            {select('To', to, setTo)}
          </div>

          {!valid && amount.trim() !== '' && (
            <p role="alert" className="text-sm font-semibold text-fee">Enter a number, for example 150 or 150,50.</p>
          )}
        </section>

        <section aria-live="polite" className="flex flex-col gap-4 rounded-lg bg-indigo-950 p-6 text-cloth md:p-7 lg:col-span-5">
          <p className="text-sm text-indigo-100/80">{valid ? formatMoney(value, from) : '—'} is</p>
          <p data-testid="result" className="break-all font-mono text-3xl font-semibold md:text-4xl">
            {result === null ? '—' : formatMoney(shown, to)}
          </p>
          <StitchLine dark trigger={`${from}${to}${result}`} from={from} to={rate ? `× ${formatRate(rate)} → ${to}` : to} />
          {missing ? (
            <p className="text-sm text-indigo-100/80">No rate for {missing} right now. EUR and XAF always work.</p>
          ) : (
            <p className="text-sm text-indigo-100/80">
              {pegged ? 'Fixed peg set by the BEAC, it does not change.' : `Via the euro, ECB rate of ${formatDate(date)}.`}
            </p>
          )}
        </section>
      </div>

      {table.length > 0 && (
        <section className="rounded-lg border border-indigo-100">
          <h2 className="border-b border-indigo-100 px-6 py-4 font-display text-xl font-semibold">{formatMoney(value, from)} in other currencies</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2">
            {table.map((row) => (
              <li key={row.code} className="flex items-baseline justify-between gap-4 border-b border-indigo-100 px-6 py-3 sm:odd:border-r">
                <span className="text-sm text-muted">{row.name}</span>
                {row.value === null
                  ? <span className="text-sm text-muted">Unavailable</span>
                  : <span className="font-mono font-semibold">{formatMoney(row.value, row.code)}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default Converter
