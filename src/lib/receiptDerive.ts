/**
 * Turns raw form state into the strings that appear on the document, and
 * computes the derived rows (amount in words, balance due).
 */
import { amountToWords, formatRupees, parseAmount } from './amountWords'
import type { ReceiptData, ReceiptKey } from './receiptSchema'

/** `2026-09-01` -> `01/09/2026`, the format used in the source receipt. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  return `${m[3]}/${m[2]}/${m[1]}`
}

export type ReceiptDisplay = Record<ReceiptKey, string>

export function deriveReceipt(data: ReceiptData): ReceiptDisplay {
  const figures = parseAmount(data.amountFigures)
  const committed = parseAmount(data.totalCommitted)
  const received = parseAmount(data.totalReceived)
  const balance = committed !== null && received !== null ? committed - received : null

  return {
    companyName: data.companyName,
    receiptNo: data.receiptNo,
    date: formatDate(data.date),
    projectCode: data.projectCode,
    receivedFrom: data.receivedFrom,
    memberType: data.memberType,
    amountFigures: formatRupees(figures),
    amountWords: amountToWords(figures),
    purpose: data.purpose,
    paymentMode: data.paymentMode,
    transactionRef: data.transactionRef,
    totalCommitted: formatRupees(committed),
    totalReceived: formatRupees(received),
    balanceDue: formatRupees(balance),
  }
}

export interface Issue {
  key: ReceiptKey
  message: string
  level: 'error' | 'warning'
}

/** Light-touch checks surfaced in the editor before download. */
export function validateReceipt(data: ReceiptData): Issue[] {
  const issues: Issue[] = []

  if (!data.receiptNo.trim()) {
    issues.push({ key: 'receiptNo', message: 'Receipt number is required.', level: 'error' })
  }
  if (!data.receivedFrom.trim()) {
    issues.push({
      key: 'receivedFrom',
      message: '"Received From" name is empty.',
      level: 'error',
    })
  }
  if (parseAmount(data.amountFigures) === null) {
    issues.push({ key: 'amountFigures', message: 'Enter a valid amount.', level: 'error' })
  }
  if (!data.transactionRef.trim() && data.paymentMode !== 'Cash') {
    issues.push({
      key: 'transactionRef',
      message: 'A reference number is recommended for non-cash payments.',
      level: 'warning',
    })
  }

  const committed = parseAmount(data.totalCommitted)
  const received = parseAmount(data.totalReceived)
  if (committed !== null && received !== null && received > committed) {
    issues.push({
      key: 'totalReceived',
      message: 'Total received exceeds the total committed investment.',
      level: 'warning',
    })
  }
  return issues
}
