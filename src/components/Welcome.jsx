import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wheel } from './ndop/motifs'

const STEPS = [
  {
    title: 'Your money in euros',
    text: 'Add what you earn and what you spend each month. Nkap shows where your money goes.',
    icon: <path d="M2 4 H30 M2 13 H30 M2 22 H30 M10 4 V13 M22 4 V13 M5 13 V22 M17 13 V22 M28 13 V22" />,
  },
  {
    title: 'What really reaches home',
    text: 'Record each transfer with its fee. Nkap shows what arrived in XAF and what the service cost you.',
    icon: <><path d="M16 1 L25 16 L16 31 L7 16 Z" /><path d="M16 8 L20.5 16 L16 24 L11.5 16 Z" /></>,
  },
  {
    title: 'Plan for your family',
    text: 'Set recurring support like school fees, then follow each month how much you have sent.',
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
        <p className="font-mono text-xs uppercase tracking-[0.18em]">Welcome to Nkap</p>
        <button type="button" onClick={onDone} className="text-sm text-indigo-100/80 underline underline-offset-4 hover:text-cloth">
          Skip
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <svg viewBox="0 0 32 32" className="h-14 w-14 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          {current.icon}
        </svg>
        <p className="font-mono text-xs text-muted">Step {step + 1} of {STEPS.length}</p>
        <h2 id="welcome-title" className="font-display text-2xl font-bold">{current.title}</h2>
        <p className="max-w-sm text-muted">{current.text}</p>

        <ol className="mt-2 flex gap-2" aria-hidden="true">
          {STEPS.map((s, i) => (
            <li key={s.title} className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-indigo-600' : 'bg-indigo-100'}`} />
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="rounded-md px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100">
              Back
            </button>
          )}
          {last ? (
            <>
              <button type="button" onClick={onDemo} className="rounded-md border border-indigo-600 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100">
                Explore with demo data
              </button>
              <Link to="/sent-home" onClick={onDone} className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-indigo-800">
                Record my first transfer
              </Link>
            </>
          ) : (
            <button type="button" onClick={() => setStep(step + 1)} className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800">
              Next
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted">No account needed. Everything stays on this device.</p>
      </div>
    </section>
  )
}

export default Welcome
