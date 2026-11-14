import { useEffect, useMemo, useRef, useState } from 'react'
import { useTransferStore } from '../store/useTransferStore'
import { useCommitmentStore } from '../store/useCommitmentStore'
import { transferResult, formatEur } from '../utils/currency'
import { SERVICES } from '../utils/services'
import { todayISO, formatDate } from '../utils/dates'
import { recentRecipients } from '../utils/stats'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import CostBadge from './CostBadge'
import StitchLine from './StitchLine'
import { formatXaf } from '../utils/currency'
import { t, tError, formatNumber, langInfo } from '../i18n'

const fieldClass =
  'mt-1.5 w-full rounded-md border border-field bg-surface px-3.5 py-3 text-base text-ink focus:border-accent'

/**
 * Record a transfer, or edit one when `editing` is set. The parent remounts the
 * form with a new `key` to switch between the two, so fields start from `editing`.
 */
function TransferForm({ editing = null, onDone, message = '' }) {
  const addTransfer = useTransferStore((state) => state.addTransfer)
  const updateTransfer = useTransferStore((state) => state.updateTransfer)
  const transfers = useTransferStore((state) => state.transfers)
  const recent = useMemo(() => recentRecipients(transfers, 3), [transfers])

  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [fee, setFee] = useState(editing ? String(editing.fee) : '')
  const [service, setService] = useState(editing?.service ?? SERVICES[0])
  const [recipient, setRecipient] = useState(editing?.recipient ?? '')
  const [date, setDate] = useState(editing?.date ?? todayISO())
  const commitments = useCommitmentStore((state) => state.commitments)
  const [commitmentId, setCommitmentId] = useState(editing?.commitmentId ?? '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(message)
  const [repeated, setRepeated] = useState('')
  const formRef = useRef(null)
  const amountRef = useRef(null)

  useEffect(() => {
    if (!editing) return
    formRef.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' })
    amountRef.current?.focus({ preventScroll: true })
  }, [editing])

  const hasInput = amount !== '' || fee !== ''
  const preview = transferResult(amount, fee === '' ? 0 : fee)
  const shownReceived = useAnimatedNumber(preview.valid ? preview.received : 0)

  /** "Send again": copy a past transfer into the form, dated today */
  const repeat = (tx) => {
    setAmount(String(tx.amount))
    setFee(String(tx.fee))
    setService(tx.service)
    setRecipient(tx.recipient)
    setCommitmentId(commitments.some((c) => c.id === tx.commitmentId) ? tx.commitmentId : '')
    setDate(todayISO())
    setError('')
    setSaved('')
    setRepeated(t('transferForm.repeated', { recipient: tx.recipient, date: formatDate(tx.date) }))
    amountRef.current?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const input = { amount, fee: fee === '' ? 0 : fee, service, recipient, date, commitmentId: commitmentId || null }
    const result = editing ? updateTransfer(editing.id, input) : addTransfer(input)
    if (!result.ok) {
      setError(result.error)
      setSaved('')
      return
    }
    if (editing) {
      return onDone?.(t('transferForm.updated', { xaf: formatXaf(result.transfer.received), recipient: result.transfer.recipient }))
    }
    setError('')
    setRepeated('')
    setSaved(t('transferForm.saved', { xaf: formatXaf(result.transfer.received), recipient: result.transfer.recipient }))
    setAmount('')
    setFee('')
  }

  const clearMessages = () => {
    setError('')
    setSaved('')
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className={`flex scroll-mt-6 flex-col gap-5 rounded-lg border p-6 md:p-7 ${editing ? 'border-accent' : 'border-indigo-100'}`}
    >
      <h2 className="font-display text-xl font-semibold">{editing ? t('transferForm.editTitle') : t('transferForm.title')}</h2>

      {!editing && recent.length > 0 && (
        <div>
          <p className="text-sm font-semibold">{t('transferForm.sendAgain')}</p>
          <ul className="mt-1.5 flex flex-wrap gap-2">
            {recent.map((tx) => (
              <li key={tx.id}>
                <button
                  type="button"
                  onClick={() => repeat(tx)}
                  aria-label={t('transferForm.sendAgainTo', { recipient: tx.recipient, service: tx.service, amount: formatEur(tx.amount) })}
                  className="flex items-center gap-2 rounded-full border border-field px-3 py-1.5 text-left text-sm hover:border-accent hover:bg-hover"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5" />
                  </svg>
                  <span><span className="font-semibold">{tx.recipient}</span> <span className="text-muted">· {tx.service} · {formatEur(tx.amount)}</span></span>
                </button>
              </li>
            ))}
          </ul>
          {repeated && <p role="status" className="mt-2 text-sm text-accent">{repeated}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm font-semibold">
          {t('transferForm.amount')}
          <input
            ref={amountRef}
            className={`${fieldClass} font-mono`}
            type="text"
            inputMode="decimal"
            placeholder="100.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); clearMessages() }}
          />
        </label>
        <label className="text-sm font-semibold">
          {t('transferForm.fee')}
          <input
            className={`${fieldClass} font-mono`}
            type="text"
            inputMode="decimal"
            placeholder="1.20"
            value={fee}
            onChange={(e) => { setFee(e.target.value); clearMessages() }}
          />
        </label>
      </div>

      <label className="text-sm font-semibold">
        {t('transferForm.service')}
        <select className={fieldClass} value={service} onChange={(e) => setService(e.target.value)}>
          {SERVICES.map((s) => (
            <option key={s} value={s}>{s === 'Other' ? t('transferForm.otherService') : s}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          {t('transferForm.recipient')}
          <input
            className={fieldClass}
            type="text"
            maxLength={60}
            placeholder={t('transferForm.recipientPlaceholder')}
            value={recipient}
            onChange={(e) => { setRecipient(e.target.value); clearMessages() }}
          />
        </label>
        <label className="text-sm font-semibold">
          {t('common.date')}
          <input className={`${fieldClass} font-mono`} type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      {commitments.length > 0 && (
        <label className="text-sm font-semibold">
          {t('transferForm.for')} <span className="font-normal text-muted">{t('common.optional')}</span>
          <select className={fieldClass} value={commitmentId} onChange={(e) => setCommitmentId(e.target.value)}>
            <option value="">{t('transferForm.noCommitment')}</option>
            {commitments.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </label>
      )}

      <StitchLine trigger={preview.valid ? preview.received : 'none'} />

      <div className="rounded-lg bg-indigo-950 p-5 text-cloth" aria-live="polite">
        <p className="text-sm text-mist/80">{t('transferForm.receives')}</p>
        {preview.valid ? (
          <>
            <p className="mt-1 font-mono text-4xl font-semibold tracking-tight" data-testid="received">
              {formatNumber(Math.round(shownReceived))} <span className="text-lg text-mist/80">{langInfo().xaf}</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 font-mono text-sm text-mist/80">
              <span>{t('transferForm.afterFee', { eur: formatEur(preview.net) })}</span>
              <CostBadge cost={preview.cost} tone="dark" />
            </div>
          </>
        ) : (
          <p className={`mt-1 text-base ${hasInput ? 'text-[#F4C9C4]' : 'text-mist/80'}`}>
            {hasInput ? tError(preview.error) : t('transferForm.hint')}
          </p>
        )}
      </div>

      {error && <p role="alert" className="text-sm font-semibold text-fee">{tError(error)}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="flex-1 rounded-md bg-indigo-600 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-800">
          {editing ? t('common.saveChanges') : t('transferForm.save')}
        </button>
        {editing && (
          <button type="button" onClick={() => onDone?.('')} className="rounded-md border border-field px-5 py-3.5 font-semibold text-ink hover:bg-hover">
            {t('common.cancel')}
          </button>
        )}
      </div>

      {saved && <p role="status" className="text-sm font-semibold text-received">{saved}</p>}
    </form>
  )
}

export default TransferForm
