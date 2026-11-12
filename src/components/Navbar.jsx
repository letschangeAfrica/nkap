import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/sent-home', label: 'Sent Home' },
  { to: '/converter', label: 'Converter' },
  { to: '/settings', label: 'Settings' },
]

function Navbar() {
  return (
    <header className="bg-indigo-950 text-cloth">
      <nav aria-label="Main" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-3 text-cloth no-underline">
          <Logo />
          <span className="font-display text-xl font-bold">Nkap</span>
        </Link>
        <ul className="flex flex-wrap gap-1">
          {links.map((link) => (
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
    </header>
  )
}

export default Navbar
