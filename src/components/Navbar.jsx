import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'
import NdopBand from './ndop/NdopBand'
import { t } from '../i18n'
import LanguageSwitcher from './LanguageSwitcher'

export const NAV_LINKS = [
  { to: '/dashboard', key: 'dashboard' },
  { to: '/transactions', key: 'transactions' },
  { to: '/sent-home', key: 'sentHome' },
  { to: '/converter', key: 'converter' },
  { to: '/settings', key: 'settings' },
]

function Navbar() {
  return (
    <header className="bg-indigo-950 text-cloth">
      <nav aria-label={t('nav.main')} className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-3 text-cloth no-underline">
          <Logo />
          <span className="font-display text-xl font-bold">Nkap</span>
        </Link>
        <div className="flex items-center gap-3 md:gap-5">
        <ul className="hidden gap-1 lg:flex">
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
                {t(`nav.${link.key}`)}
              </NavLink>
            </li>
          ))}
        </ul>
        <LanguageSwitcher />
        </div>
      </nav>
      <NdopBand id="nk-band-nav" className="h-3 text-cloth/20" />
    </header>
  )
}

export default Navbar
