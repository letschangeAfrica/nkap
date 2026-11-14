# Nkap

**Know what supporting your family really costs.**

Nkap is a personal-finance dashboard for the African diaspora in Europe. It puts your budget in euros and the money you send home in CFA francs (XAF) side by side, and makes the fee on every transfer visible.

> ALX AI for Developers II · Front-End Capstone · Ismaël Ariel Kagou Manga

**Live demo:** _add your Netlify URL here_

## The problem

Bank apps track your spending. Transfer apps (Wise, Orange Money, Western Union…) each track only their own transfers. Nobody shows both together, so most people never see how much of their money goes to fees. The World Bank's [Remittance Prices Worldwide](https://remittanceprices.worldbank.org/) report consistently ranks sub-Saharan Africa as the most expensive region in the world to send money to.

## Features

| Page | What it does |
|---|---|
| **Landing** | Explains the product. Opens the app with no sign-up. |
| **Dashboard** | This month's income, spending, money sent home and fees, a 6-month chart (my life vs. family support), family plan progress, the cheapest service you've used and how much you'd have saved, recent activity. Empty state with one-click demo data. |
| **Transactions** | Add income and expenses in EUR by category, monthly totals, history with delete. |
| **Sent Home** | Record a transfer (amount, fee, service, recipient). A live preview shows what arrives in XAF and the cost in percent, with a Low / Medium / High badge. Monthly totals and average cost by service. |
| **Converter** | EUR ⇄ XAF with the fixed peg, plus USD, GBP, CAD, CHF and CNY with live ECB rates. Works offline with the last saved rates. |
| **Settings** | Family commitments (e.g. school fees per month, in XAF), load demo data, delete all data. |

## Languages

Nkap is available in **English**, **French** and **Cameroonian Pidgin English** (Kamtok). The first visit follows the browser's language; the switch in the top bar (and in Settings) changes it and remembers the choice on the device.

- Numbers, money and dates follow the language: `92,228 XAF` in English, `92 228 FCFA` in French, `92,228 FCFA` in Pidgin.
- `<html lang>`, the page title and the demo video change with the language.
- The Pidgin translation is a **draft** that should be reviewed by a native speaker.
- To add a language: copy `src/i18n/en.js` to `src/i18n/<code>.js`, translate the values, and add one line to `LANGUAGES` in `src/i18n/index.js`. A test fails if any key or `{placeholder}` is missing.

## How the money maths works

- The CFA franc (XAF) is pegged to the euro by the BEAC: **1 EUR = 655.957 XAF**. EUR ⇄ XAF is calculated locally and is always exact, even offline.
- The fee is taken from the amount sent: `received = (amount − fee) × 655.957`, rounded to the franc.
- Cost = `fee ÷ amount`. **Low** below 5 %, **Medium** from 5 % to below 10 %, **High** from 10 %.
- Other currencies use the European Central Bank reference rates from the free [Frankfurter API](https://frankfurter.dev/v1/) (no key). The ECB does not publish XAF, so those conversions go through the euro.
- If the API is down, the converter uses the last rates saved on the device and shows their date. If none were saved, it says so and EUR ⇄ XAF keeps working.

## Tech stack

- **React 19** + **Vite 6**
- **React Router 7** for routing
- **Zustand 5** with the `persist` middleware for state (saved to `localStorage`)
- **Tailwind CSS v4**, with design tokens in `src/index.css`
- **Vitest** + **Testing Library** for unit and component tests
- Deployed on **Netlify** (`public/_redirects` sends every route to `index.html`)

## Getting started

```bash
git clone https://github.com/letschangeAfrica/nkap.git
cd nkap
npm install
npm run dev        # http://localhost:5173
npm test           # watch mode (works from any terminal, including VS Code's c:\ path)
npm run test:run   # single run
npm run test:coverage
npm run test:e2e   # Playwright smoke tests on the production build (first: npx playwright install chromium)
npm run build      # production build in dist/
```

## Project structure

```
src/
  components/   UI pieces (forms, lists, chart, badges, navigation, Ndop motifs)
  pages/        one file per route
  store/        Zustand stores: transactions, transfers, commitments
  hooks/        useAnimatedNumber, useRates
  utils/        currency maths, rates API, dates, statistics, demo data
  __tests__/    Vitest test files
```

## Privacy and security

- **No account, no server, no bank connection.** Nkap never asks for a login or bank credentials.
- All data is stored only in the browser's `localStorage` on the user's device. Nothing is sent anywhere.
- The only network request is to the Frankfurter API for exchange rates. It sends no personal data. Fonts are self-hosted (no Google Fonts requests).
- A strict Content-Security-Policy and other security headers are set in `public/_headers`.
- Saved data is checked when it is loaded; if it still can't be displayed, an error screen offers to reset it.
- **Settings → Delete all my data** erases everything after a confirmation.
- User input is validated (amounts > 0, fee smaller than the amount) and rendered by React, which escapes it. The app never uses `dangerouslySetInnerHTML`.
- Limit: data in `localStorage` is not encrypted. Anyone with access to the unlocked device and browser can read it. Don't use Nkap on a shared computer.

## Accessibility

- Semantic landmarks, labelled form fields, and errors announced with `role="alert"`.
- Visible focus styles, and keyboard support for every control.
- The chart has a text summary for screen readers.
- Text colours meet WCAG AA contrast.
- Animations (stitch line, number roll, chart bars) are turned off when the user prefers reduced motion.
- Light and dark themes. **System** (the default) follows the device; Light or Dark can be chosen in the top bar or in Settings. The theme is applied before the first paint, so there is no white flash.

## Design

The visual language is inspired by **Ndop cloth** of the Bamileke and Grassfields chiefdoms of Cameroon: indigo and white resist-dyed textile, lozenges, running stitches and chequer bands. Numbers are set in IBM Plex Mono so amounts line up; headings use Instrument Sans.

## Credits

- Exchange rates: [Frankfurter](https://frankfurter.dev/), using European Central Bank data
- Fonts: [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans), [IBM Plex](https://www.ibm.com/plex/) (Google Fonts)
- Ndop-inspired patterns: original SVG, drawn for this project
