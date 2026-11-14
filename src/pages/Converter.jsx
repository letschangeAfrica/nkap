import { useMemo, useState } from 'react'
import { parseAmount } from '../utils/currency'
import { formatDate } from '../utils/dates'
import { CURRENCIES, convert, unitRate, hasRate, formatMoney, formatRate, currencyName } from '../utils/rates'
import { useRates } from '../hooks/useRates'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import StitchLine from '../components/StitchLine'
import { t } from '../i18n'

const fieldClass =
  'mt-1.5 w-full rounded-md border border-field bg-surface px-3.5 py-3 text-base text-ink focus:border-accent'
const QUICK = [50, 100, 200, 500]

function RateStatus({ status, date, retry }) {
  if (status === 'loading') return <p role="status" className="text-sm text-muted">{t('converter.loading')}</p>
  if (status === 'live') return <p role="status" className="text-sm text-muted">{t('converter.live', { date: formatDate(date) })}</p>
  return (
    <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-warn-line bg-warn px-4 py-3 text-sm">
      <p>
        {status === 'cached'
          ? t('converter.cached', { date: formatDate(date) })
          : t('converter.offline')}
      </p>
      <button type="button" onClick={retry} disabled={status === 'loading'} className="font-semibold text-accent underline underline-offset-4 disabled:opacity-50">{t('converter.retry')}</button>
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
    () => (valid ? CURRENCIES.filter((c) => c.code !== from).map((c) => ({ code: c.code, name: currencyName(c.code), value: convert(value, from, c.code, rates) })) : []),
    [valid, value, from, rates],
  )

  const swap = () => { setFrom(to); setTo(from) }

  const select = (label, current, onChange) => (
    <label className="text-sm font-semibold">
      {label}
      <select className={fieldClass} value={current} onChange={(e) => onChange(e.target.value)}>
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} · {currencyName(c.code)}{hasRate(c.code, rates) ? '' : ` (${t('converter.unavailable').toLowerCase()})`}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t('nav.converter')}</h1>
        <p className="mt-2 text-muted">{t('converter.lead')}</p>
      </header>

      <RateStatus status={status} date={date} retry={retry} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <section className="flex flex-col gap-5 rounded-lg border border-indigo-100 p-6 md:p-7 lg:col-span-7">
          <label className="text-sm font-semibold">
            {t('converter.amount')}
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
                className="rounded-full border border-indigo-100 px-3 py-1 font-mono text-sm hover:border-accent"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
            {select(t('converter.from'), from, setFrom)}
            <button
              type="button"
              onClick={swap}
              aria-label={t('converter.swap')}
              className="mb-1 inline-flex h-11 w-11 items-center justify-self-center justify-center rounded-md border border-indigo-100 text-accent hover:bg-indigo-100"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 8 H18 L14 4 M20 16 H6 L10 20" />
              </svg>
            </button>
            {select(t('converter.to'), to, setTo)}
          </div>

          {!valid && amount.trim() !== '' && (
            <p role="alert" className="text-sm font-semibold text-fee">{t('converter.invalid')}</p>
          )}
        </section>

        <section aria-live="polite" className="flex flex-col gap-4 rounded-lg bg-indigo-950 p-6 text-cloth md:p-7 lg:col-span-5">
          <p className="text-sm text-mist/80">{valid ? t('converter.is', { amount: formatMoney(value, from) }) : '—'}</p>
          <p data-testid="result" className="break-all font-mono text-3xl font-semibold md:text-4xl">
            {result === null ? '—' : formatMoney(shown, to)}
          </p>
          <StitchLine dark trigger={`${from}${to}${result}`} from={from} to={rate ? `× ${formatRate(rate)} → ${to}` : to} />
          {missing ? (
            <p className="text-sm text-mist/80">{t('converter.missing', { code: missing })}</p>
          ) : (
            <p className="text-sm text-mist/80">
              {pegged ? t('converter.peg') : t('converter.viaEuro', { date: formatDate(date) })}
            </p>
          )}
        </section>
      </div>

      {table.length > 0 && (
        <section className="rounded-lg border border-indigo-100">
          <h2 className="border-b border-indigo-100 px-6 py-4 font-display text-xl font-semibold">{t('converter.tableTitle', { amount: formatMoney(value, from) })}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2">
            {table.map((row) => (
              <li key={row.code} className="flex items-baseline justify-between gap-4 border-b border-indigo-100 px-6 py-3 sm:odd:border-r">
                <span className="text-sm text-muted">{row.name}</span>
                {row.value === null
                  ? <span className="text-sm text-muted">{t('converter.unavailable')}</span>
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
