import { useState } from 'react'
import TransferForm from '../components/TransferForm'
import TransferSummary from '../components/TransferSummary'
import TransferHistory from '../components/TransferHistory'
import { t } from '../i18n'

function SentHome() {
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')
  const finishEdit = (msg) => {
    setMessage(msg)
    setEditing(null)
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t('nav.sentHome')}</h1>
        <p className="mt-2 text-muted">{t('sentHome.lead')}</p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TransferForm key={editing?.id ?? `new-${message}`} editing={editing} onDone={finishEdit} message={message} />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-7">
          <TransferSummary />
          <TransferHistory onEdit={(tx) => { setMessage(''); setEditing(tx) }} editingId={editing?.id} />
        </div>
      </div>
    </div>
  )
}

export default SentHome
