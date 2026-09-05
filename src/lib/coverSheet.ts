/**
 * Prepends the company letterhead to a source PDF as a cover page.
 *
 * The two governing documents are prose contracts: their text is authoritative
 * and is never re-typeset or moved. They are also typeset with a 1-inch top
 * margin, which is not deep enough to hold the letterhead — stamping it onto
 * page 1 would overlap the opening lines. So the letterhead is issued as a new
 * first page instead, and every original page is copied through untouched.
 *
 * The band is drawn with pdf-lib primitives rather than captured from the DOM,
 * so it renders identically whether or not a browser layout pass has settled.
 * Only the Tamil title needs the canvas rasteriser, since neither pdf-lib nor
 * the standard fonts can shape Tamil.
 */
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'

import { COMPANY } from '../data/company'
import { asset } from './asset'
import { textToPng } from './textImage'

/** US Letter, matching the source documents. */
const PAGE_W = 612
const PAGE_H = 792

/* The screen letterhead is laid out at 96dpi; 1px there is 0.75pt here. */
const PX = 0.75
const MARGIN = 67.2 * PX
const CORNER = 206 * PX
const WEDGE_INSET = 30 * PX
const WEDGE = 148 * PX
const INDENT = MARGIN + 38 * PX

const ORANGE = rgb(1, 0x7a / 255, 0x01 / 255)
const INK = rgb(0x17 / 255, 0x18 / 255, 0x1a / 255)

export interface CoverInput {
  /** Document title as printed on the cover — Tamil, so it is rasterised. */
  title: string
  /** Optional English subtitle, printed under the title. */
  subtitle?: string
  /** Shown under the rule, e.g. "7 pages · signed by 2 of 5". */
  note?: string
}

/**
 * Returns `bytes` with a letterhead cover page in front. If anything in the
 * cover fails — a missing logo, a canvas the browser refuses — the original
 * bytes are returned unchanged rather than blocking the download.
 */
export async function prependLetterhead(
  bytes: ArrayBuffer | Uint8Array,
  { title, subtitle, note }: CoverInput,
): Promise<Uint8Array> {
  const source = await PDFDocument.load(bytes, { updateMetadata: false })
  try {
    const out = await PDFDocument.create()
    const page = out.addPage([PAGE_W, PAGE_H])
    const regular = await out.embedFont(StandardFonts.Helvetica)
    const bold = await out.embedFont(StandardFonts.HelveticaBold)

    // Corner marks. drawSvgPath's origin is the point given as x/y with y
    // running downward, so both triangles are expressed from the page top.
    page.drawSvgPath(`M 0 0 L ${CORNER} 0 L 0 ${CORNER} Z`, {
      x: 0,
      y: PAGE_H,
      color: ORANGE,
    })
    page.drawSvgPath(`M 0 0 L ${WEDGE} 0 L 0 ${WEDGE} Z`, {
      x: WEDGE_INSET,
      y: PAGE_H - WEDGE_INSET,
      color: INK,
    })

    // Contact block, starting clear of the wedge's lower corner.
    let y = PAGE_H - (WEDGE_INSET + WEDGE) - 26
    page.drawText(COMPANY.legalName, { x: INDENT, y, size: 11, font: bold, color: INK })
    y -= 15
    for (const line of [
      'HO : Namakkal.',
      COMPANY.phone,
      COMPANY.email,
      COMPANY.website,
    ]) {
      page.drawText(line, { x: INDENT, y, size: 8.5, font: regular, color: INK })
      y -= 12
    }

    // Logo, right-aligned against the same margin as the text block.
    const logo = await embedLogo(out)
    if (logo) {
      const w = 153
      const h = (logo.height / logo.width) * w
      page.drawImage(logo, {
        x: PAGE_W - MARGIN - w,
        y: PAGE_H - (WEDGE_INSET + WEDGE) - 20 - h + 24,
        width: w,
        height: h,
      })
    }

    y -= 6
    page.drawLine({
      start: { x: INDENT, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 1.5,
      color: INK,
    })

    // Title block, centred in the space below the band.
    const column = PAGE_W - MARGIN * 2
    let ty = y - 150
    const heading = await textToPng(title, { fontSize: 19, bold: true, color: '#17181a' })
    if (heading) {
      // The rasteriser lays the title out on one line at whatever width the
      // glyphs need; Tamil titles run long, so scale the bitmap down to the
      // text column rather than letting it bleed off the page.
      const fit = Math.min(1, column / heading.width)
      const w = heading.width * fit
      const h = heading.height * fit
      const img = await out.embedPng(heading.dataUrl)
      page.drawImage(img, { x: (PAGE_W - w) / 2, y: ty, width: w, height: h })
      ty -= h + 10
    }
    if (subtitle) {
      const w = regular.widthOfTextAtSize(subtitle, 11)
      page.drawText(subtitle, {
        x: (PAGE_W - w) / 2,
        y: ty,
        size: 11,
        font: regular,
        color: rgb(0.35, 0.36, 0.38),
      })
      ty -= 22
    }
    if (note) {
      const w = regular.widthOfTextAtSize(note, 9)
      page.drawText(note, {
        x: (PAGE_W - w) / 2,
        y: ty,
        size: 9,
        font: regular,
        color: rgb(0.45, 0.46, 0.48),
      })
    }

    page.drawText(COMPANY.tagline, {
      x: MARGIN,
      y: 54,
      size: 8,
      font: regular,
      color: rgb(0.45, 0.46, 0.48),
      rotate: degrees(0),
    })

    // Copy the source through unchanged, including its page sizes.
    const copied = await out.copyPages(source, source.getPageIndices())
    for (const p of copied) out.addPage(p)
    return await out.save()
  } catch {
    // Never let cover art stand between the user and their document.
    return await source.save()
  }
}

async function embedLogo(doc: PDFDocument) {
  try {
    const res = await fetch(asset('assets/logo.png'))
    if (!res.ok) return null
    return await doc.embedPng(await res.arrayBuffer())
  } catch {
    return null
  }
}
