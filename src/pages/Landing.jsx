import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

function Landing() {
  return (
    <div className="min-h-screen bg-indigo-950 text-cloth">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-display text-xl font-bold">Nkap</span>
        </div>
        <Link to="/dashboard" className="rounded-md bg-cloth px-4 py-2 text-sm font-semibold text-indigo-950 no-underline hover:bg-indigo-100">
          Open the app
        </Link>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <p className="font-mono text-xs uppercase tracking-widest text-indigo-100/70">EUR ⇄ XAF · for the diaspora</p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Know what supporting your family really costs.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-indigo-100/80">
          Your budget in euros and the money you send home in CFA francs, side by side, with every fee made visible.
        </p>
        <Link to="/dashboard" className="mt-8 inline-block rounded-md bg-cloth px-6 py-3 font-semibold text-indigo-950 no-underline hover:bg-indigo-100">
          Get started, it's free
        </Link>
      </section>
    </div>
  )
}

export default Landing
