import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'

export const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', short: 'Home' },
  { to: '/transactions', label: 'Transactions', short: 'Spending' },
  { to: '/sent-home', label: 'Sent Home', short: 'Sent Home' },
  { to: '/converter', label: 'Converter', short: 'Convert' },
  { to: '/settings', label: 'Settings', short: 'Settings' },
]

function Navbar() {
  return (
    <header className="bg-indigo-950 text-cloth">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-3 text-cloth no-underline">
          <Logo />
          <span className="font-display text-xl font-bold">Nkap</span>
        </Link>
        <ul className="hidden gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm no-underline transition-colors ${
                    isActive ? 'font-semibold text-cloth shadow-[inset_0_-2px_0_currentColor]' : 'text-indigo-100/70 hover:text-cloth'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <svg className="block h-2 w-full" aria-hidden="true">
        <defs>
          <pattern id="nk-chequer" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="currentColor" />
            <rect x="4" y="4" width="4" height="4" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nk-chequer)" opacity="0.16" />
      </svg>
    </header>
  )
}

export default Navbar
