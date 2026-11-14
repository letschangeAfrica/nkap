import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import NdopPattern from '../components/NdopPattern'
import NdopCloth from '../components/ndop/NdopCloth'
import NdopBand from '../components/ndop/NdopBand'
import { Wheel } from '../components/ndop/motifs'
import HeroCalculator from '../components/HeroCalculator'
import Reveal from '../components/Reveal'
import RemittanceStat from '../components/RemittanceStat'
import DemoVideo from '../components/DemoVideo'
import { compareServices } from '../utils/exampleFees'
import { formatXaf } from '../utils/currency'
import { t } from '../i18n'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ThemeToggle from '../components/ThemeToggle'

const WHY_EXAMPLE = compareServices(150)

const FEATURES = [
  {
    key: 'fees',
    icon: <><path d="M16 1 L25 16 L16 31 L7 16 Z" /><path d="M16 8 L20.5 16 L16 24 L11.5 16 Z" /><circle cx="5" cy="5" r="1.2" fill="currentColor" /><circle cx="27" cy="5" r="1.2" fill="currentColor" /><circle cx="5" cy="27" r="1.2" fill="currentColor" /><circle cx="27" cy="27" r="1.2" fill="currentColor" /></>,
  },
  {
    key: 'exact',
    icon: <Wheel cx={16} cy={16} r={13} sw={1.5} />,
  },
  {
    key: 'plan',
    icon: <path d="M2 3 H30 M2 12 H30 M2 21 H30 M2 30 H30 M11 3 V12 M23 3 V12 M6 12 V21 M18 12 V21 M13 21 V30 M26 21 V30" />,
  },
]

function Landing() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ---------- hero ---------- */}
      <div className="relative overflow-hidden bg-indigo-950 text-cloth">
        <header className="relative z-10 border-b border-white/10">
          <nav aria-label={t('nav.main')} className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
            <Link to="/" className="flex items-center gap-3 text-cloth no-underline">
              <Logo />
              <span className="font-display text-xl font-bold">Nkap</span>
            </Link>
            <div className="flex items-center gap-3 md:gap-6">
              <ul className="hidden gap-6 text-sm md:flex">
                <li><a href="#how" className="text-cloth/90 no-underline hover:text-cloth">{t('landing.nav.how')}</a></li>
                <li><a href="#why" className="text-cloth/90 no-underline hover:text-cloth">{t('landing.nav.why')}</a></li>
                <li><a href="#privacy" className="text-cloth/90 no-underline hover:text-cloth">{t('landing.nav.privacy')}</a></li>
              </ul>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
              <Link to="/dashboard" className="rounded-md bg-cloth px-4 py-2 text-sm font-semibold text-indigo-950 no-underline hover:bg-mist">
                {t('landing.openApp')}
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
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-mist/70">{t('landing.eyebrow')}</p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              {t('landing.title')}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-mist/85">
              {t('landing.lead')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard" className="rounded-md bg-cloth px-6 py-3 font-semibold text-indigo-950 no-underline hover:bg-mist">
                {t('landing.start')}
              </Link>
              <a href="#how" className="rounded-md border border-mist/40 px-6 py-3 font-semibold text-cloth no-underline hover:bg-white/5">
                {t('landing.seeHow')}
              </a>
            </div>
            <p className="mt-6 text-sm text-mist/70">{t('landing.trust')}</p>
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
          <Reveal className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-16">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t('landing.how.title')}</h2>
            <p className="text-lg text-muted">
              {t('landing.how.lead')}
            </p>
          </Reveal>
          <ol className="mt-12 grid grid-cols-1 border-t border-indigo-100 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal as="li" delay={i * 120} key={f.key} className="border-b border-indigo-100 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
                <svg viewBox="0 0 32 32" className="h-9 w-9 text-ink" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  {f.icon}
                </svg>
                <p className="mt-5 font-mono text-xs text-accent">0{i + 1}</p>
                <h3 className="mt-2 font-display text-xl font-semibold">{t(`landing.features.${f.key}.title`)}</h3>
                <p className="mt-3 text-muted">{t(`landing.features.${f.key}.text`, { rate: '655.957' })}</p>
              </Reveal>
            ))}
          </ol>

          <div className="mt-16 grid grid-cols-1 items-center gap-12 rounded-lg bg-sunken px-6 py-12 md:px-12 lg:grid-cols-2">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{t('landing.demo.eyebrow')}</p>
              <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">{t('landing.demo.title')}</h3>
              <ol className="mt-6 flex flex-col gap-4">
                {['record', 'arrives', 'cost', 'month'].map((step) => [t(`landing.demo.steps.${step}.title`), t(`landing.demo.steps.${step}.text`, { xaf: formatXaf(64809) })]).map(([title, text], i) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent font-mono text-xs text-accent">{i + 1}</span>
                    <p><span className="font-semibold">{title}.</span> <span className="text-muted">{text}</span></p>
                  </li>
                ))}
              </ol>
            </Reveal>
            <DemoVideo className="mb-12 sm:mb-0" />
          </div>
        </section>

        <RemittanceStat />

        {/* ---------- why ---------- */}
        <section id="why" className="mx-auto grid max-w-6xl scroll-mt-6 grid-cols-1 items-center gap-12 px-4 py-20 md:px-8 md:py-24 lg:grid-cols-2 lg:gap-24">
          <Reveal className="relative order-2 h-80 overflow-hidden rounded-lg bg-indigo-100 text-accent/30 sm:h-96 lg:order-1">
            <NdopCloth id="ndop-why" ground="var(--color-indigo-100)" className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 sm:p-8">
              <div className="w-fit rounded-md bg-surface p-4 text-ink shadow-sm">
                <p className="text-xs text-muted">{t('landing.why.example')}</p>
                <ul className="mt-2 flex flex-col gap-1.5 font-mono text-sm">
                  {WHY_EXAMPLE.rows.map((r) => {
                    const worst = Math.min(...WHY_EXAMPLE.rows.map((x) => x.received))
                    const tone = r.name === WHY_EXAMPLE.best.name ? 'text-received' : r.received === worst ? 'text-fee' : ''
                    return (
                      <li key={r.name} className="flex justify-between gap-8"><span>{r.name}</span><span className={tone}>{formatXaf(r.received)}</span></li>
                    )
                  })}
                </ul>
                <p className="mt-3 border-t border-indigo-100 pt-2 text-xs text-muted">{t('landing.why.exampleNote')}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120} className="order-1 lg:order-2">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{t('landing.nav.why')}</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {t('landing.why.title')}
            </h2>
            <p className="mt-5 text-lg text-muted">
              {t('landing.why.lead')}
            </p>
          </Reveal>
        </section>

        {/* ---------- privacy ---------- */}
        <section id="privacy" className="relative scroll-mt-6 overflow-hidden bg-indigo-950 text-cloth">
          <NdopPattern id="ndop-privacy" className="absolute inset-0 h-full w-full text-indigo-800" opacity={0.8} />
          <Reveal className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-16 md:flex-row md:items-center md:px-8">
            <div>
              <h2 className="font-display text-3xl font-bold">{t('landing.privacy.title')}</h2>
              <p className="mt-3 max-w-xl text-lg text-mist/85">
                {t('landing.privacy.text')}
              </p>
            </div>
            <Link to="/dashboard" className="rounded-md bg-cloth px-6 py-3 font-semibold text-indigo-950 no-underline hover:bg-mist">
              {t('landing.privacy.cta')}
            </Link>
          </Reveal>
        </section>
      </main>

      <NdopBand id="nk-band-footer" className="h-4 bg-indigo-950 text-cloth/20" />
      <footer className="bg-indigo-950 text-sm text-mist/70">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-4 py-8 md:flex-row md:px-8">
          <p>{t('landing.footer.credit')}</p>
          <p>{t('landing.footer.ndop')}</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
