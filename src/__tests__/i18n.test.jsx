// @vitest-environment jsdom
import { describe, test, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LANGUAGES, t, tError, useLangStore, detectLanguage } from '../i18n'
import en from '../i18n/en'
import { formatEur, formatXaf } from '../utils/currency'
import { formatMonth } from '../utils/dates'
import { buildInsights } from '../utils/insights'
import { buildDemoData } from '../utils/demoData'
import App from '../App'

const keys = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]))
const placeholders = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join()

afterEach(() => useLangStore.setState({ lang: 'en' }))

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
    const original = Object.getOwnPropertyDescriptor(Navigator.prototype, 'languages')
    Object.defineProperty(navigator, 'languages', { value: ['fr-FR', 'en'], configurable: true })
    expect(detectLanguage()).toBe('fr')
    Object.defineProperty(navigator, 'languages', { value: ['de-DE'], configurable: true })
    expect(detectLanguage()).toBe('en')
    if (original) Object.defineProperty(Navigator.prototype, 'languages', original)
    delete navigator.languages
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
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Know what supporting your family really costs.')

    await user.selectOptions(screen.getByLabelText('Language'), 'fr')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sachez ce que soutenir votre famille vous coûte vraiment.')
    expect(document.documentElement.lang).toBe('fr')
    expect(document.title).toMatch(/Budget et soutien familial/)

    await user.selectOptions(screen.getByLabelText('Langue'), 'wes')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Sabi how much/)
    expect(document.documentElement.lang).toBe('wes')
  })
})
