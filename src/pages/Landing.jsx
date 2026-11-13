import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import NdopPattern from '../components/NdopPattern'
import NdopCloth from '../components/ndop/NdopCloth'
import NdopBand from '../components/ndop/NdopBand'
import { Wheel } from '../components/ndop/motifs'
import HeroCalculator from '../components/HeroCalculator'

const FEATURES = [
  {
    title: 'See every fee',
    text: 'Record a transfer once. Nkap shows what arrived in XAF and what the service cost you, in percent.',
    icon: <><path d="M16 1 L25 16 L16 31 L7 16 Z" /><path d="M16 8 L20.5 16 L16 24 L11.5 16 Z" /><circle cx="5" cy="5" r="1.2" fill="currentColor" /><circle cx="27" cy="5" r="1.2" fill="currentColor" /><circle cx="5" cy="27" r="1.2" fill="currentColor" /><circle cx="27" cy="27" r="1.2" fill="currentColor" /></>,
  },
  {
    title: 'EUR and XAF, exact',
    text: 'The CFA franc is pegged at 1 € = 655.957 XAF, so conversions stay exact, even when the rates API is offline.',
    icon: <Wheel cx={16} cy={16} r={13} sw={1.5} />,
  },
  {
    title: 'Plan family commitments',
    text: 'Set recurring support like school fees and see each month how much you have sent against the plan.',
    icon: <path d="M2 3 H30 M2 12 H30 M2 21 H30 M2 30 H30 M11 3 V12 M23 3 V12 M6 12 V21 M18 12 V21 M13 21 V30 M26 21 V30" />,
  },
]

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

        <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-14 md:px-8 lg:grid-cols-[5fr_6fr] lg:pb-24 lg:pt-20">
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

          <div className="relative">
            <div className="relative h-56 overflow-hidden rounded-lg bg-indigo-800 text-cloth/80 sm:h-72 lg:ml-32 lg:h-[32rem]">
              <NdopCloth id="ndop-hero" className="absolute inset-0 h-full w-full" />
            </div>
            <HeroCalculator className="relative mx-3 -mt-24 sm:mx-auto sm:max-w-md lg:absolute lg:left-0 lg:top-1/2 lg:mx-0 lg:mt-0 lg:w-[22.5rem] lg:-translate-y-1/2" />
          </div>
        </section>

        <NdopBand id="nk-band-hero" className="h-4 text-cloth/25" />
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
          <div className="relative order-2 h-80 overflow-hidden rounded-lg bg-indigo-100 text-indigo-600/30 sm:h-96 lg:order-1">
            <NdopCloth id="ndop-why" ground="var(--color-indigo-100)" className="absolute inset-0 h-full w-full" />
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
          <NdopPattern id="ndop-privacy" className="absolute inset-0 h-full w-full text-indigo-800" opacity={0.8} />
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

      <NdopBand id="nk-band-footer" className="h-4 bg-indigo-950 text-cloth/20" />
      <footer className="bg-indigo-950 text-sm text-indigo-100/70">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-4 py-8 md:flex-row md:px-8">
          <p>Nkap · ALX Front-End Capstone · Ismaël Ariel Kagou Manga</p>
          <p>Visual language inspired by Ndop cloth of the Bamileke and Grassfields chiefdoms of Cameroon.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
