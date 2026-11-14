import { useEffect, useRef, useState } from 'react'
import { useTransactionStore, CATEGORIES } from '../store/useTransactionStore'
import { todayISO } from '../utils/dates'
import { t, tError } from '../i18n'

const fieldClass =
  'mt-1.5 w-full rounded-md border border-field bg-surface px-3.5 py-3 text-base text-ink focus:border-accent'

/**
 * Add a transaction, or edit one when `editing` is set. The parent remounts the
 * form with a new `key` to switch between the two, so fields start from `editing`.
 */
function TransactionForm({ editing = null, onDone, message = '' }) {
  const addTransaction = useTransactionStore((state) => state.addTransaction)
  const updateTransaction = useTransactionStore((state) => state.updateTransaction)

  const [type, setType] = useState(editing?.type ?? 'expense')
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [category, setCategory] = useState(editing?.category ?? CATEGORIES.expense[0])
  const [date, setDate] = useState(editing?.date ?? todayISO())
  const [note, setNote] = useState(editing?.note ?? '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(message)
  const formRef = useRef(null)
  const amountRef = useRef(null)

  // Bring the form into view and put the cursor in the amount when editing starts
  useEffect(() => {
    if (!editing) return
    formRef.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' })
    amountRef.current?.focus({ preventScroll: true })
  }, [editing])

  const changeType = (next) => {
    setType(next)
    setCategory(CATEGORIES[next][0])
    setError('')
    setSaved('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const input = { type, amount, category, date, note }
    const result = editing ? updateTransaction(editing.id, input) : addTransaction(input)
    if (!result.ok) {
      setError(result.error)
      setSaved('')
      return
    }
    if (editing) return onDone?.(t('txForm.updated'))
    setError('')
    setSaved(t(`txForm.saved.${type}`))
    setAmount('')
    setNote('')
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className={`flex scroll-mt-6 flex-col gap-5 rounded-lg border p-6 md:p-7 ${editing ? 'border-accent' : 'border-indigo-100'}`}
    >
      <h2 className="font-display text-xl font-semibold">{editing ? t('txForm.editTitle') : t('txForm.title')}</h2>

      <fieldset>
        <legend className="text-sm font-semibold">{t('txForm.type')}</legend>
        <div className="mt-1.5 grid grid-cols-2 rounded-md border border-field p-1">
          {['expense', 'income'].map((kind) => (
            <label
              key={kind}
              className={`cursor-pointer rounded px-3 py-2.5 text-center text-sm font-semibold capitalize transition-colors has-focus-visible:outline-2 has-focus-visible:outline-accent ${
                type === kind ? 'bg-selected text-on-selected' : 'text-muted hover:bg-indigo-100'
              }`}
            >
              <input type="radio" name="type" value={kind} checked={type === kind} onChange={() => changeType(kind)} className="sr-only" />
              {t(`txForm.kinds.${kind}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm font-semibold">
          {t('txForm.amount')}
          <input
            ref={amountRef}
            className={`${fieldClass} font-mono`}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(''); setSaved('') }}
          />
        </label>
        <label className="text-sm font-semibold">
          {t('common.date')}
          <input className={`${fieldClass} font-mono`} type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <label className="text-sm font-semibold">
        {t('txForm.category')}
        <select className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES[type].map((c) => (
            <option key={c} value={c}>{t(`categories.${c}`)}</option>
          ))}
        </select>
      </label>

      <label className="text-sm font-semibold">
        {t('txForm.note')} <span className="font-normal text-muted">{t('common.optional')}</span>
        <input className={fieldClass} type="text" maxLength={80} placeholder={t('txForm.notePlaceholder')} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>

      {error && <p role="alert" className="text-sm font-semibold text-fee">{tError(error)}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="flex-1 rounded-md bg-indigo-600 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-800">
          {editing ? t('common.saveChanges') : t(`txForm.save.${type}`)}
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

export default TransactionForm
