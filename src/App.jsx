import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import SentHome from './pages/SentHome'
import Converter from './pages/Converter'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { useEffect } from 'react'
import { t, useLang } from './i18n'
import UpdateBanner from './components/UpdateBanner'

function App() {
  const lang = useLang()

  // keep <html lang>, the tab title and the description in the chosen language
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t('meta.title')
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'))
  }, [lang])

  return (
    <>
    <UpdateBanner key={`update-${lang}`} />
    {/* keyed by language: every page re-renders with the new texts and number formats */}
    <Routes key={lang}>
      {/* Public marketing page, without the app navigation */}
      <Route path="/" element={<Landing />} />

      {/* App pages share the Layout (navbar + page container) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/sent-home" element={<SentHome />} />
        <Route path="/converter" element={<Converter />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  )
}

export default App
