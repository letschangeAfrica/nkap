import { NavLink } from 'react-router-dom'
import { NAV_LINKS } from './Navbar'

const icons = {
  '/dashboard': <path d="M3 11 L12 3 L21 11 V21 H3 Z" />,
  '/transactions': <path d="M4 6 H20 M4 12 H20 M4 18 H14" />,
  '/sent-home': <><path d="M12 2 L22 12 L12 22 L2 12 Z" strokeDasharray="3 2.4" /><path d="M12 8 L16 12 L12 16 L8 12 Z" fill="currentColor" /></>,
  '/converter': <path d="M4 8 H18 L14 4 M20 16 H6 L10 20" />,
  '/settings': <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></>,
}

/** Mobile navigation, fixed to the bottom of the screen. */
function BottomTabBar() {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-10 border-t border-indigo-100 bg-white md:hidden">
      <ul className="grid grid-cols-5">
        {NAV_LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] no-underline ${
                  isActive ? 'font-semibold text-indigo-950 shadow-[inset_0_2px_0_currentColor]' : 'text-muted'
                }`
              }
            >
              <svg viewBox="0 0 24 24" className="h-5.5 w-5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {icons[link.to]}
              </svg>
              {link.short}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default BottomTabBar
