/**
 * Client-side PDF signing with pdf-lib.
 *
 * There is no backend, so the signed file itself carries the roster of who
 * has signed: the records are written into the PDF's Keywords metadata. When
 * the next signer uploads the file the app reads that roster back, shows the
 * progress ("3/5 signed") and blocks a slot that is already taken. Signatures
 * therefore accumulate as the file is passed from signer to signer, and no
 * earlier signature is ever lost.
 */
import { PDFDocument } from 'pdf-lib'
import { INK_GAP, INK_MAX_HEIGHT, type SignatureSlot } from './signatureSlots'
import { textToPng, type TextImage } from './textImage'

const META_PREFIX = 'NEXUSSIG1:'

export interface SignatureRecord {
  slotId: string
  role: string
  signerName: string
  /** Free-text designation; only the policy document prints one. */
  designation?: string
  /** ISO date the signature was applied. */
  signedAt: string
}

/* ---------------- metadata roster ---------------- */

function encodeRoster(records: SignatureRecord[]): string {
  const json = JSON.stringify(records)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return META_PREFIX + btoa(binary)
}

function decodeRoster(keywords: string | undefined): SignatureRecord[] {
  if (!keywords) return []
  const marker = keywords.indexOf(META_PREFIX)
  if (marker === -1) return []
  const payload = keywords.slice(marker + META_PREFIX.length).trim()
  try {
    const binary = atob(payload)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const parsed = JSON.parse(new TextDecoder().decode(bytes))
    return Array.isArray(parsed) ? (parsed as SignatureRecord[]) : []
  } catch {
    // A third-party tool may have rewritten the metadata; treat as unsigned
    // rather than failing the whole document.
    return []
  }
}

/** Reads the signature roster out of a PDF without modifying it. */
export async function readSignatures(bytes: ArrayBuffer): Promise<SignatureRecord[]> {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false })
  return decodeRoster(doc.getKeywords())
}

/* ---------------- stamping ---------------- */

export interface SignInput {
  /** The PDF to sign — the pristine original, or a partially signed file. */
  bytes: ArrayBuffer
  pageIndex: number
  slot: SignatureSlot
  /** Trimmed signature ink as a PNG data URL. */
  inkPng: string
  signerName: string
  designation?: string
  /** Display date, e.g. "01/09/2026". */
  dateText: string
}

export interface SignResult {
  bytes: Uint8Array
  roster: SignatureRecord[]
}

export async function applySignature({
  bytes,
  pageIndex,
  slot,
  inkPng,
  signerName,
  designation,
  dateText,
}: SignInput): Promise<SignResult> {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false })
  const pages = doc.getPages()
  const page = pages[pageIndex]
  if (!page) throw new Error(`Signature page ${pageIndex + 1} not found in this PDF`)

  const roster = decodeRoster(doc.getKeywords())
  if (roster.some((r) => r.slotId === slot.id)) {
    throw new Error(`${slot.role} has already signed this document.`)
  }

  // --- signature ink, fitted above the printed rule ---
  const ink = await doc.embedPng(inkPng)
  const ruleWidth = slot.ruleX[1] - slot.ruleX[0]
  const fit = Math.min(ruleWidth / ink.width, INK_MAX_HEIGHT / ink.height)
  const inkW = ink.width * fit
  const inkH = ink.height * fit
  page.drawImage(ink, {
    // Centre the ink over the rule; it reads better than a hard left edge.
    x: slot.ruleX[0] + (ruleWidth - inkW) / 2,
    y: slot.ruleY + INK_GAP,
    width: inkW,
    height: inkH,
  })

  // --- name (and designation) beside the printed label ---
  const nameText = designation?.trim()
    ? `${signerName.trim()} — ${designation.trim()}`
    : signerName.trim()
  // Some templates print only a date line, so stamp whatever the slot has.
  if (slot.nameAt) await stampText(doc, page, nameText, slot.nameAt)
  if (slot.dateAt) await stampText(doc, page, dateText, slot.dateAt)

  const nextRoster: SignatureRecord[] = [
    ...roster,
    {
      slotId: slot.id,
      role: slot.role,
      signerName: signerName.trim(),
      designation: designation?.trim() || undefined,
      signedAt: new Date().toISOString(),
    },
  ]
  doc.setKeywords([encodeRoster(nextRoster)])

  return { bytes: await doc.save(), roster: nextRoster }
}

async function stampText(
  doc: PDFDocument,
  page: ReturnType<PDFDocument['getPages']>[number],
  text: string,
  at: { x: number; y: number },
): Promise<void> {
  // 10.5pt matches the printed Tamil labels these values sit beside.
  const img: TextImage | null = await textToPng(text, { fontSize: 10.5 })
  if (!img) return
  const embedded = await doc.embedPng(img.dataUrl)
  page.drawImage(embedded, {
    x: at.x,
    // Align the rasterised baseline with the printed label's baseline.
    y: at.y - img.baselineFromBottom,
    width: img.width,
    height: img.height,
  })
}

/** Wraps signed bytes in a PDF Blob. */
export function toPdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
}

/** Triggers a browser download for the signed bytes. */
export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const url = URL.createObjectURL(toPdfBlob(bytes))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
