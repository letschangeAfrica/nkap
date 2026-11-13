import { useState } from 'react'
import { useTransactionStore, CATEGORIES } from '../store/useTransactionStore'
import { todayISO } from '../utils/dates'
import { t, tError } from '../i18n'

const fieldClass =
  'mt-1.5 w-full rounded-md border border-[#B9C0DD] bg-white px-3.5 py-3 text-base text-ink focus:border-indigo-600'

function TransactionForm() {
  const addTransaction = useTransactionStore((state) => state.addTransaction)

  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES.expense[0])
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  const changeType = (next) => {
    setType(next)
    setCategory(CATEGORIES[next][0])
    setError('')
    setSaved('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = addTransaction({ type, amount, category, date, note })
    if (!result.ok) {
      setError(result.error)
      setSaved('')
      return
    }
    setError('')
    setSaved(t(`txForm.saved.${type}`))
    setAmount('')
    setNote('')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 rounded-lg border border-indigo-100 p-6 md:p-7">
      <h2 className="font-display text-xl font-semibold">{t('txForm.title')}</h2>

      <fieldset>
        <legend className="text-sm font-semibold">{t('txForm.type')}</legend>
        <div className="mt-1.5 grid grid-cols-2 rounded-md border border-[#B9C0DD] p-1">
          {['expense', 'income'].map((kind) => (
            <label
              key={kind}
              className={`cursor-pointer rounded px-3 py-2.5 text-center text-sm font-semibold capitalize transition-colors has-focus-visible:outline-2 has-focus-visible:outline-indigo-600 ${
                type === kind ? 'bg-indigo-950 text-cloth' : 'text-muted hover:bg-indigo-100'
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

      <button type="submit" className="rounded-md bg-indigo-600 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-800">
        {t(`txForm.save.${type}`)}
      </button>

      {saved && <p role="status" className="text-sm font-semibold text-received">{saved}</p>}
    </form>
  )
}

export default TransactionForm
