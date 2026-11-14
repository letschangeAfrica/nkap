import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wheel } from './ndop/motifs'
import { t } from '../i18n'

const STEPS = [
  {
    key: 'money',
    icon: <path d="M2 4 H30 M2 13 H30 M2 22 H30 M10 4 V13 M22 4 V13 M5 13 V22 M17 13 V22 M28 13 V22" />,
  },
  {
    key: 'home',
    icon: <><path d="M16 1 L25 16 L16 31 L7 16 Z" /><path d="M16 8 L20.5 16 L16 24 L11.5 16 Z" /></>,
  },
  {
    key: 'plan',
    icon: <Wheel cx={16} cy={16} r={13} sw={1.6} />,
  },
]

/** First-visit welcome: three short steps, then a way in. */
function Welcome({ onDone, onDemo }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const last = step === STEPS.length - 1

  return (
    <section aria-labelledby="welcome-title" className="overflow-hidden rounded-lg border border-indigo-100">
      <div className="flex items-center justify-between bg-indigo-950 px-6 py-3 text-cloth">
        <p className="font-mono text-xs uppercase tracking-[0.18em]">{t('welcome.title')}</p>
        <button type="button" onClick={onDone} className="text-sm text-mist/80 underline underline-offset-4 hover:text-cloth">
          {t('welcome.skip')}
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <svg viewBox="0 0 32 32" className="h-14 w-14 text-accent" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          {current.icon}
        </svg>
        <p className="font-mono text-xs text-muted">{t('welcome.step', { n: step + 1, total: STEPS.length })}</p>
        <h2 id="welcome-title" className="font-display text-2xl font-bold">{t(`welcome.steps.${current.key}.title`)}</h2>
        <p className="max-w-sm text-muted">{t(`welcome.steps.${current.key}.text`)}</p>

        <ol className="mt-2 flex gap-2" aria-hidden="true">
          {STEPS.map((s, i) => (
            <li key={s.key} className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-indigo-600' : 'bg-indigo-100'}`} />
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="rounded-md px-4 py-2.5 text-sm font-semibold text-accent hover:bg-indigo-100">
              {t('common.back')}
            </button>
          )}
          {last ? (
            <>
              <button type="button" onClick={onDemo} className="rounded-md border border-accent px-4 py-2.5 text-sm font-semibold text-accent hover:bg-indigo-100">
                {t('common.exploreDemo')}
              </button>
              <Link to="/sent-home" onClick={onDone} className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-indigo-800">
                {t('welcome.firstTransfer')}
              </Link>
            </>
          ) : (
            <button type="button" onClick={() => setStep(step + 1)} className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800">
              {t('common.next')}
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">{t('welcome.privacy')}</p>
      </div>
    </section>
  )
}

export default Welcome
