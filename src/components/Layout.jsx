import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import BottomTabBar from './BottomTabBar'
import OfflineBanner from './OfflineBanner'

function Layout() {
  const { pathname } = useLocation()
  // each page opens at the top, not at the previous page's scroll position
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <OfflineBanner />
      {/* extra bottom padding on mobile so content is not hidden behind the tab bar */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-8 md:px-8 lg:pb-12">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}

export default Layout
