import { useState } from 'react'
import { useTransferStore } from '../store/useTransferStore'
import { transferResult, formatEur } from '../utils/currency'
import { SERVICES } from '../utils/services'
import { todayISO } from '../utils/dates'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import CostBadge from './CostBadge'
import StitchLine from './StitchLine'
import { formatXaf } from '../utils/currency'
import { t, tError, formatNumber, langInfo } from '../i18n'

const fieldClass =
  'mt-1.5 w-full rounded-md border border-[#B9C0DD] bg-white px-3.5 py-3 text-base text-ink focus:border-indigo-600'

function TransferForm() {
  const addTransfer = useTransferStore((state) => state.addTransfer)

  const [amount, setAmount] = useState('')
  const [fee, setFee] = useState('')
  const [service, setService] = useState(SERVICES[0])
  const [recipient, setRecipient] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  const hasInput = amount !== '' || fee !== ''
  const preview = transferResult(amount, fee === '' ? 0 : fee)
  const shownReceived = useAnimatedNumber(preview.valid ? preview.received : 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = addTransfer({ amount, fee: fee === '' ? 0 : fee, service, recipient, date })
    if (!result.ok) {
      setError(result.error)
      setSaved('')
      return
    }
    setError('')
    setSaved(t('transferForm.saved', { xaf: formatXaf(result.transfer.received), recipient: result.transfer.recipient }))
    setAmount('')
    setFee('')
  }

  const clearMessages = () => {
    setError('')
    setSaved('')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 rounded-lg border border-indigo-100 p-6 md:p-7">
      <h2 className="font-display text-xl font-semibold">{t('transferForm.title')}</h2>

      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm font-semibold">
          {t('transferForm.amount')}
          <input
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

      <StitchLine trigger={preview.valid ? preview.received : 'none'} />

      <div className="rounded-lg bg-indigo-950 p-5 text-cloth" aria-live="polite">
        <p className="text-sm text-indigo-100/80">{t('transferForm.receives')}</p>
        {preview.valid ? (
          <>
            <p className="mt-1 font-mono text-4xl font-semibold tracking-tight" data-testid="received">
              {formatNumber(Math.round(shownReceived))} <span className="text-lg text-indigo-100/80">{langInfo().xaf}</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 font-mono text-sm text-indigo-100/80">
              <span>{t('transferForm.afterFee', { eur: formatEur(preview.net) })}</span>
              <CostBadge cost={preview.cost} tone="dark" />
            </div>
          </>
        ) : (
          <p className={`mt-1 text-base ${hasInput ? 'text-[#F4C9C4]' : 'text-indigo-100/80'}`}>
            {hasInput ? tError(preview.error) : t('transferForm.hint')}
          </p>
        )}
      </div>

      {error && <p role="alert" className="text-sm font-semibold text-fee">{tError(error)}</p>}

      <button type="submit" className="rounded-md bg-indigo-600 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-800">
        {t('transferForm.save')}
      </button>

      {saved && <p role="status" className="text-sm font-semibold text-received">{saved}</p>}
    </form>
  )
}

export default TransferForm
