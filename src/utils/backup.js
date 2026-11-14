import { useTransactionStore } from '../store/useTransactionStore'
import { useTransferStore } from '../store/useTransferStore'
import { useCommitmentStore } from '../store/useCommitmentStore'
import { isTransaction, isTransfer, isCommitment } from './validate'
import { todayISO } from './dates'

export const BACKUP_APP = 'nkap'
export const BACKUP_VERSION = 1
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024
export const LAST_BACKUP_KEY = 'nkap-last-backup'

/* ---------------- CSV (for spreadsheets) ---------------- */

/**
 * One CSV cell. Text that a spreadsheet would run as a formula (=, +, -, @, tab,
 * carriage return) is prefixed with ' so a note like "=HYPERLINK(...)" stays text.
 */
export function csvCell(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return String(value)
  let s = String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const HEADER = ['kind', 'date', 'amount_eur', 'fee_eur', 'received_xaf', 'cost_percent', 'category_or_service', 'note_or_recipient', 'commitment']

/** Transactions and transfers in one sheet, newest first. Starts with a BOM so Excel reads UTF-8. */
export function toCsv({ transactions, transfers, commitments }) {
  const label = (id) => commitments.find((c) => c.id === id)?.label ?? ''
  const rows = [
    ...transactions.map((t) => [t.type, t.date, t.amount, '', '', '', t.category, t.note ?? '', '']),
    ...transfers.map((t) => ['transfer', t.date, t.amount, t.fee, t.received, t.cost, t.service, t.recipient, label(t.commitmentId)]),
  ].sort((a, b) => b[1].localeCompare(a[1]))
  return '﻿' + [HEADER, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

/* ---------------- Backup file (save and restore) ---------------- */

export function makeBackup({ transactions, transfers, commitments }, now = new Date()) {
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(), transactions, transfers, commitments }
}

// Only the fields the app uses are restored, whatever else the file contains.
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]))
const TX_KEYS = ['id', 'createdAt', 'type', 'amount', 'category', 'date', 'note']
const TR_KEYS = ['id', 'createdAt', 'amount', 'fee', 'service', 'recipient', 'date', 'received', 'cost', 'commitmentId']
const CO_KEYS = ['id', 'label', 'monthlyXaf']

/**
 * Read a backup file's text. Returns { ok: true, data, skipped } or { ok: false, error }.
 * Records that fail the same checks as saved data are skipped, never imported.
 */
export function parseBackup(text) {
  if (typeof text !== 'string' || text.length > MAX_BACKUP_BYTES) return { ok: false, error: 'tooBig' }
  let raw
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'notBackup' }
  }
  if (!raw || raw.app !== BACKUP_APP || typeof raw.version !== 'number') return { ok: false, error: 'notBackup' }
  if (raw.version > BACKUP_VERSION) return { ok: false, error: 'newer' }

  let skipped = 0
  const keep = (list, isValid, keys) => {
    if (!Array.isArray(list)) return []
    const out = []
    const ids = new Set()
    for (const item of list) {
      const clean = item && typeof item === 'object' ? pick(item, keys) : null
      if (clean && isValid(clean) && !ids.has(clean.id)) {
        ids.add(clean.id)
        out.push(clean)
      } else skipped += 1
    }
    return out
  }
  const commitments = keep(raw.commitments, isCommitment, CO_KEYS)
  const known = new Set(commitments.map((c) => c.id))
  const transfers = keep(raw.transfers, isTransfer, TR_KEYS).map((t) => ({ ...t, commitmentId: known.has(t.commitmentId) ? t.commitmentId : null }))
  const transactions = keep(raw.transactions, isTransaction, TX_KEYS)
  return { ok: true, data: { transactions, transfers, commitments }, skipped }
}

/** Replace everything on this device with the backup's data. */
export function restoreBackup({ transactions, transfers, commitments }) {
  useCommitmentStore.setState({ commitments })
  useTransferStore.setState({ transfers })
  useTransactionStore.setState({ transactions })
}

export const currentData = () => ({
  transactions: useTransactionStore.getState().transactions,
  transfers: useTransferStore.getState().transfers,
  commitments: useCommitmentStore.getState().commitments,
})

/** Hand a file to the browser's downloads. */
export function downloadFile(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const backupFileName = (now = new Date()) => `nkap-backup-${todayISO(now)}.json`
export const csvFileName = (now = new Date()) => `nkap-export-${todayISO(now)}.csv`

export function getLastBackup() {
  try {
    const v = localStorage.getItem(LAST_BACKUP_KEY)
    return /^\d{4}-\d{2}-\d{2}$/.test(v ?? '') ? v : null
  } catch {
    return null
  }
}

export function setLastBackup(date = todayISO()) {
  try {
    if (date) localStorage.setItem(LAST_BACKUP_KEY, date)
    else localStorage.removeItem(LAST_BACKUP_KEY)
  } catch {
    /* storage blocked: the reminder simply shows again */
  }
}
