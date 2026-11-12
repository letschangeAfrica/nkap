import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import NdopPattern from '../components/NdopPattern'

const FEATURES = [
  {
    title: 'See every fee',
    text: 'Record a transfer once. Nkap shows what arrived in XAF and what the service cost you, in percent.',
    icon: <><path d="M16 2 L30 16 L16 30 L2 16 Z" strokeDasharray="3 2.5" /><path d="M16 9 L23 16 L16 23 L9 16 Z" fill="currentColor" /></>,
  },
  {
    title: 'EUR and XAF, exact',
    text: 'The CFA franc is pegged at 1 € = 655.957 XAF, so conversions stay exact, even when the rates API is offline.',
    icon: <><circle cx="16" cy="16" r="14" /><circle cx="16" cy="16" r="8" strokeDasharray="3 2.5" /><circle cx="16" cy="16" r="3" fill="currentColor" /></>,
  },
  {
    title: 'Plan family commitments',
    text: 'Set recurring support like school fees and see each month how much you have sent against the plan.',
    icon: <><rect x="3" y="3" width="26" height="26" /><path d="M16 3 V29 M3 16 H29" strokeDasharray="3 2.5" /></>,
  },
]

function TransferCard({ className = '' }) {
  return (
    <div className={`rounded-lg bg-white p-5 text-ink shadow-[0_16px_40px_rgba(10,18,51,0.35)] ${className}`}>
      <p className="text-xs text-muted">Transfer · Wise · 12 Nov</p>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <span className="text-sm text-muted">You sent</span>
        <span className="font-mono text-lg font-semibold">100.00 €</span>
      </div>
      <svg className="my-3 h-1.5 w-full" viewBox="0 0 300 6" preserveAspectRatio="none" aria-hidden="true">
        <line className="nk-stitch-run" x1="0" y1="3" x2="300" y2="3" stroke="var(--color-indigo-600)" strokeWidth="2.5" strokeDasharray="7 6" strokeLinecap="round" />
      </svg>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-muted">Family received</span>
        <span className="font-mono text-2xl font-semibold text-received">64,809 XAF</span>
      </div>
      <div className="mt-4 flex justify-between gap-4 border-t border-indigo-100 pt-3 text-xs">
        <span className="text-muted">Fee 1.20 €</span>
        <span className="font-mono font-semibold text-received">Cost 1.2% · Low</span>
      </div>
    </div>
  )
}

function Landing() {
  return (
    <div className="min-h-screen bg-white text-ink">
      {/* ---------- hero ---------- */}
      <div className="relative overflow-hidden bg-indigo-950 text-cloth">
        <header className="relative z-10 border-b border-white/10">
          <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
            <Link to="/" className="flex items-center gap-3 text-cloth no-underline">
              <Logo />
              <span className="font-display text-xl font-bold">Nkap</span>
            </Link>
            <div className="flex items-center gap-6">
              <ul className="hidden gap-6 text-sm md:flex">
                <li><a href="#how" className="text-cloth/90 no-underline hover:text-cloth">How it works</a></li>
                <li><a href="#why" className="text-cloth/90 no-underline hover:text-cloth">Why Nkap</a></li>
                <li><a href="#privacy" className="text-cloth/90 no-underline hover:text-cloth">Privacy</a></li>
              </ul>
              <Link to="/dashboard" className="rounded-md bg-cloth px-4 py-2 text-sm font-semibold text-indigo-950 no-underline hover:bg-indigo-100">
                Open the app
              </Link>
            </div>
          </nav>
        </header>

        <svg className="pointer-events-none absolute -left-24 top-24 h-[420px] w-[420px] text-indigo-600/40" viewBox="0 0 400 400" aria-hidden="true">
          <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" />
          <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeDasharray="6 5" />
          <path d="M120 -40 L440 280" stroke="currentColor" />
        </svg>

        <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-14 md:px-8 lg:grid-cols-2 lg:pb-24 lg:pt-20">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-100/70">EUR ⇄ XAF · for the diaspora</p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Know what supporting your family really costs.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-indigo-100/85">
              Nkap puts your budget in euros and the money you send home in CFA francs side by side, and shows the fees every
              transfer takes on the way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard" className="rounded-md bg-cloth px-6 py-3 font-semibold text-indigo-950 no-underline hover:bg-indigo-100">
                Get started, it's free
              </Link>
              <a href="#how" className="rounded-md border border-indigo-100/40 px-6 py-3 font-semibold text-cloth no-underline hover:bg-white/5">
                See how it works
              </a>
            </div>
            <p className="mt-6 text-sm text-indigo-100/70">No account · No bank login · Data stays on your device</p>
          </div>

          <div className="relative pb-16 sm:pb-10 lg:pb-0">
            <div className="relative h-72 overflow-hidden rounded-lg bg-indigo-800 text-indigo-600 sm:h-96">
              <NdopPattern id="ndop-hero" className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-800 to-transparent" />
            </div>
            <TransferCard className="absolute -bottom-2 left-4 right-4 sm:left-auto sm:right-auto sm:-left-6 sm:w-80 lg:-bottom-8" />
          </div>
        </section>

        <svg className="block h-2.5 w-full text-cloth" aria-hidden="true">
          <defs>
            <pattern id="nk-chequer-hero" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="5" height="5" fill="currentColor" />
              <rect x="5" y="5" width="5" height="5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nk-chequer-hero)" opacity="0.18" />
        </svg>
      </div>

      <main>
        {/* ---------- how it works ---------- */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-6 px-4 py-20 md:px-8 md:py-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-16">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Two money worlds. One clear picture.</h2>
            <p className="text-lg text-muted">
              Bank apps track your spending. Transfer apps track their own transfers. Nkap is the first place that shows both together.
            </p>
          </div>
          <ol className="mt-12 grid grid-cols-1 border-t border-indigo-100 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <li key={f.title} className="border-b border-indigo-100 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
                <svg viewBox="0 0 32 32" className="h-9 w-9 text-indigo-950" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  {f.icon}
                </svg>
                <p className="mt-5 font-mono text-xs text-indigo-600">0{i + 1}</p>
                <h3 className="mt-2 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-3 text-muted">{f.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- why ---------- */}
        <section id="why" className="mx-auto grid max-w-6xl scroll-mt-6 grid-cols-1 items-center gap-12 px-4 pb-20 md:px-8 md:pb-24 lg:grid-cols-2 lg:gap-24">
          <div className="relative order-2 h-72 overflow-hidden rounded-lg bg-indigo-100 text-indigo-600/25 sm:h-96 lg:order-1">
            <NdopPattern id="ndop-why" className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 sm:p-8">
              <div className="w-fit rounded-md bg-white p-4 text-ink shadow-sm">
                <p className="text-xs text-muted">Same 150 € sent home</p>
                <ul className="mt-2 flex flex-col gap-1.5 font-mono text-sm">
                  <li className="flex justify-between gap-8"><span>Wise</span><span className="text-received">97,213 XAF</span></li>
                  <li className="flex justify-between gap-8"><span>Orange Money</span><span>94,163 XAF</span></li>
                  <li className="flex justify-between gap-8"><span>Western Union</span><span className="text-fee">89,079 XAF</span></li>
                </ul>
                <p className="mt-3 border-t border-indigo-100 pt-2 text-xs text-muted">Example fees, for illustration</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-600">Why Nkap</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Sending money to Africa is expensive. Not knowing how expensive is worse.
            </h2>
            <p className="mt-5 text-lg text-muted">
              The World Bank consistently ranks sub-Saharan Africa as the most expensive region in the world to send money to. Nkap
              turns scattered transfers into one monthly picture, so you can choose the service that leaves more for your family.
            </p>
          </div>
        </section>

        {/* ---------- privacy ---------- */}
        <section id="privacy" className="relative scroll-mt-6 overflow-hidden bg-indigo-950 text-cloth">
          <NdopPattern id="ndop-privacy" className="absolute inset-0 h-full w-full text-indigo-800" opacity={0.6} />
          <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-16 md:flex-row md:items-center md:px-8">
            <div>
              <h2 className="font-display text-3xl font-bold">Private by design</h2>
              <p className="mt-3 max-w-xl text-lg text-indigo-100/85">
                No account, no bank connection, no server. Everything is stored in your browser, and one button deletes it all.
              </p>
            </div>
            <Link to="/dashboard" className="rounded-md bg-cloth px-6 py-3 font-semibold text-indigo-950 no-underline hover:bg-indigo-100">
              Start tracking
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-indigo-950 text-sm text-indigo-100/70">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-4 py-8 md:flex-row md:px-8">
          <p>Nkap · ALX Front-End Capstone · Ismaël Ariel Kagou Manga</p>
          <p>Visual language inspired by Ndop cloth of the Bamileke and Grassfields chiefdoms of Cameroon.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
