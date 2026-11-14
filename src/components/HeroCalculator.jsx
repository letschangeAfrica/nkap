import { useState } from 'react'
import { Link } from 'react-router-dom'
import { parseAmount, formatEur, formatXaf } from '../utils/currency'
import { compareServices } from '../utils/exampleFees'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import CostBadge from './CostBadge'
import { t } from '../i18n'

const QUICK = [50, 100, 200]

/** Landing-page "try it" card: type an amount, pick a service, see what reaches home. */
function HeroCalculator({ className = '' }) {
  const [amount, setAmount] = useState('100')
  const [service, setService] = useState('Wise')

  const value = parseAmount(amount)
  const { rows, best } = compareServices(value)
  const current = rows.find((r) => r.name === service)
  const shown = useAnimatedNumber(current.valid ? current.received : 0, 400)
  const gain = best && current.valid && best.name !== service ? best.received - current.received : 0

  let hint = null
  if (amount.trim() === '' || !Number.isFinite(value) || value <= 0) hint = t('hero.enterAmount')
  else if (!current.valid) hint = t('hero.feeTooLarge', { service, amount: formatEur(value) })

  return (
    <section
      aria-label={t('hero.label')}
      className={`rounded-lg bg-surface p-5 text-ink shadow-[0_20px_50px_rgba(10,18,51,0.45)] sm:p-6 ${className}`}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{t('hero.eyebrow')}</p>

      <label className="mt-4 block text-sm font-semibold" htmlFor="hero-amount">{t('hero.youSend')}</label>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id="hero-amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border border-field bg-surface py-2.5 pl-3.5 pr-9 font-mono text-lg font-semibold focus:border-accent"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-muted">€</span>
        </div>
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setAmount(String(q))}
            className={`hidden rounded-md border px-2.5 py-2.5 font-mono text-sm sm:block ${String(q) === amount ? 'border-accent text-accent' : 'border-indigo-100 text-muted hover:border-accent'}`}
          >
            {q}
          </button>
        ))}
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold">{t('hero.with')}</legend>
        <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-md border border-field p-1">
          {rows.map((r) => (
            <label
              key={r.name}
              className={`cursor-pointer rounded px-1 py-2 text-center text-xs font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-accent sm:text-sm ${
                service === r.name ? 'bg-selected text-on-selected' : 'text-muted hover:bg-indigo-100'
              }`}
            >
              <input type="radio" name="hero-service" value={r.name} checked={service === r.name} onChange={() => setService(r.name)} className="sr-only" />
              {r.name}
            </label>
          ))}
        </div>
      </fieldset>

      <svg className="my-4 h-1.5 w-full" viewBox="0 0 300 6" preserveAspectRatio="none" aria-hidden="true">
        <line key={`${service}-${current.received}`} className="nk-stitch-run" x1="0" y1="3" x2="300" y2="3" stroke="var(--color-indigo-600)" strokeWidth="2.5" strokeDasharray="7 6" strokeLinecap="round" />
      </svg>

      <div aria-live="polite">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-muted">{t('hero.familyReceives')}</span>
          <span data-testid="hero-received" className="font-mono text-2xl font-semibold text-received sm:text-3xl">
            {current.valid ? formatXaf(shown) : '—'}
          </span>
        </div>
        {hint ? (
          <p className="mt-3 text-sm text-muted">{hint}</p>
        ) : (
          <>
            <div className="mt-3 flex items-center justify-between gap-4 text-sm">
              <span className="text-muted">{t('common.fee')} <span className="font-mono text-fee">{formatEur(current.fee)}</span></span>
              <CostBadge cost={current.cost} />
            </div>
            <p className="mt-3 rounded-md bg-indigo-100/60 px-3 py-2 text-sm">
              {gain > 0
                ? <>{t('hero.betterWith', { service: best.name })} <span className="whitespace-nowrap font-mono font-semibold text-received">+{formatXaf(gain)}</span>.</>
                : t('hero.cheapest')}
            </p>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-indigo-100 pt-3">
        <p className="text-xs text-muted">{t('hero.note')}</p>
        <Link to="/sent-home" className="text-sm font-semibold text-accent">{t('hero.track')}</Link>
      </div>
    </section>
  )
}

export default HeroCalculator
