// @vitest-environment jsdom
import { describe, test, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LANGUAGES, t, tError, useLangStore, detectLanguage } from '../i18n'
import en from '../i18n/en'
import fr from '../i18n/fr'
import wes from '../i18n/wes'
import { formatEur, formatXaf } from '../utils/currency'
import { formatMonth } from '../utils/dates'
import { buildInsights } from '../utils/insights'
import { buildDemoData } from '../utils/demoData'
import App from '../App'

const keys = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]))
const placeholders = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join()

afterEach(() => {
  // Unmount first: resetting the language while <App /> is still mounted re-renders it
  // outside act(), which setupTests.js turns into a failure.
  cleanup()
  useLangStore.setState({ lang: 'en' })
  localStorage.clear()
})

describe('dictionaries', () => {
  const reference = keys(en).filter((k) => !k.startsWith('errors.'))

  test.each(LANGUAGES.filter((l) => l.code !== 'en').map((l) => [l.code, l.dict]))('%s has every English key, with the same placeholders', (code, dict) => {
    const lookup = (d, k) => k.split('.').reduce((n, p) => n?.[p], d)
    const missing = reference.filter((k) => typeof lookup(dict, k) !== 'string')
    expect(missing).toEqual([])
    const wrong = reference.filter((k) => placeholders(lookup(dict, k)) !== placeholders(lookup(en, k)))
    expect(wrong).toEqual([])
  })

  test.each(LANGUAGES.filter((l) => l.code !== 'en').map((l) => [l.code, l.dict]))('%s translates every validation message', (code, dict) => {
    const messages = [
      'Choose a category.', 'Choose a date (today or earlier).', 'Choose a service.', 'Choose income or expense.',
      'Choose the date of the transfer (today or earlier).', 'Enter a fee of 0 € or more.', 'Enter a monthly amount greater than 0 XAF.',
      'Enter an amount greater than 0 €.', 'Enter who received the money.', 'Give the commitment a name.',
      'The fee cannot be equal to or larger than the amount.',
      'This entry no longer exists.',
    ]
    expect(messages.filter((m) => !dict.errors[m])).toEqual([])
  })
})

describe('t()', () => {
  test('fills placeholders and falls back to English, then to the key', () => {
    expect(t('welcome.step', { n: 1, total: 3 })).toBe('Step 1 of 3')
    useLangStore.setState({ lang: 'fr' })
    expect(t('welcome.step', { n: 1, total: 3 })).toBe('Étape 1 sur 3')
    expect(t('does.not.exist')).toBe('does.not.exist')
    expect(tError('Enter an amount greater than 0 €.')).toBe('Saisissez un montant supérieur à 0 €.')
  })

  test('first visit follows the browser language', () => {
    const setLanguages = (value) => Object.defineProperty(navigator, 'languages', { value, configurable: true })
    try {
      setLanguages(['fr-FR', 'en'])
      expect(detectLanguage()).toBe('fr')
      setLanguages(['de-DE'])
      expect(detectLanguage()).toBe('en')
    } finally {
      delete navigator.languages // back to jsdom's own getter on Navigator.prototype
    }
  })

  test('ignores an unknown language code, whether saved or set', async () => {
    useLangStore.getState().setLang('xx')
    expect(useLangStore.getState().lang).toBe('en')

    localStorage.setItem('nkap-lang', JSON.stringify({ state: { lang: 'xx' }, version: 0 }))
    await useLangStore.persist.rehydrate()
    expect(useLangStore.getState().lang).toBe('en')
  })
})

describe('formatting follows the language', () => {
  test('French uses spaces, decimal commas, FCFA and French months', () => {
    useLangStore.setState({ lang: 'fr' })
    expect(formatEur(1250).replace(/\s/g, ' ')).toBe('1 250,00 €')
    expect(formatXaf(92228).replace(/\s/g, ' ')).toBe('92 228 FCFA')
    expect(formatMonth('2026-11')).toBe('novembre 2026')
  })

  test('Pidgin keeps English number format with FCFA', () => {
    useLangStore.setState({ lang: 'wes' })
    expect(formatXaf(92228)).toBe('92,228 FCFA')
    expect(formatEur(1250)).toBe('1,250.00 €')
  })

  test('insights are written in the chosen language', () => {
    const { transactions, transfers } = buildDemoData(new Date(2026, 10, 12))
    useLangStore.setState({ lang: 'fr' })
    const [first] = buildInsights({ transactions, transfers, month: '2026-11' })
    expect(first.text.replace(/\s/g, ' ')).toBe('Ce mois-ci, les frais ont coûté 6 166 FCFA à votre famille.')
  })
})

describe('switching language in the app', () => {
  test('the whole page changes and <html lang> follows', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(en.landing.title)

    await user.selectOptions(screen.getByLabelText('Language'), 'fr')
    expect(await screen.findByRole('heading', { level: 1, name: fr.landing.title })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('fr')
    expect(document.title).toBe(fr.meta.title)

    await user.selectOptions(screen.getByLabelText('Langue'), 'wes')
    expect(await screen.findByRole('heading', { level: 1, name: wes.landing.title })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('wes')
  })
})
