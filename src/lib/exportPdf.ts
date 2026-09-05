/**
 * Client-side PDF export.
 *
 * The receipt replica is rendered to a canvas by the browser (which does the
 * Tamil glyph shaping correctly) and that canvas is placed into a Letter-size
 * jsPDF page. This keeps the whole flow in the browser — no server, no
 * DOCX-to-PDF converter.
 *
 * Trade-off: the resulting PDF page is an image, so its text is not
 * selectable. `printElement` is the alternative path — the browser's own
 * "Save as PDF" produces real, selectable text with embedded fonts.
 */
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas-pro'

/** Returns true when every sampled pixel is white. */
function isBlank(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  // Every 4th pixel is plenty to detect an empty sheet, and keeps the scan cheap.
  for (let i = 0; i < data.length; i += 16) {
    if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) return false
  }
  return true
}

/** US Letter in PostScript points, matching the source document's page size. */
const PAGE_W = 612
const PAGE_H = 792

export interface ExportOptions {
  /** Render scale; 3 keeps Tamil conjuncts crisp at print resolution. */
  scale?: number
  filename: string
}

export async function exportElementToPdf(
  element: HTMLElement,
  { scale = 3, filename }: ExportOptions,
): Promise<void> {
  // Wait for Noto Sans Tamil to be ready, otherwise html2canvas can rasterise
  // the fallback font and the Tamil text comes out wrong.
  if (document.fonts?.ready) await document.fonts.ready

  /*
   * A paginated document renders one element per sheet, each already exactly
   * Letter-shaped. Rasterising them individually gives clean page boundaries —
   * no row sliced in half — so prefer that over cutting one tall canvas.
   */
  const sheets = element.querySelectorAll<HTMLElement>('[data-page]')
  if (sheets.length > 0) {
    const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true })
    for (let i = 0; i < sheets.length; i += 1) {
      const sheet = sheets[i]
      const canvas = await html2canvas(sheet, {
        scale,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        /*
         * Pin the capture box to the sheet's own border box. Left to itself
         * html2canvas measures the scroll size, so a sheet whose content
         * overflows — which happens for the split second before pagination
         * settles — was captured at its full content height and then stretched
         * across the page, throwing every proportion out.
         */
        width: sheet.offsetWidth,
        height: sheet.offsetHeight,
        windowWidth: sheet.offsetWidth,
        ignoreElements: (el) => el.hasAttribute?.('data-export-ignore'),
      })
      if (i > 0) pdf.addPage()
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        0,
        0,
        PAGE_W,
        (canvas.height / canvas.width) * PAGE_W,
      )
    }
    pdf.save(filename)
    return
  }

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    // Ignore anything explicitly marked as screen-only chrome.
    ignoreElements: (el) => el.hasAttribute?.('data-export-ignore'),
  })

  const pdf = new jsPDF({ unit: 'pt', format: 'letter', compress: true })
  const imgW = PAGE_W
  const imgH = (canvas.height / canvas.width) * PAGE_W

  if (imgH <= PAGE_H + 1) {
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, imgW, imgH)
  } else {
    // Taller than one page: slice the canvas into page-height strips so a
    // long receipt still exports correctly instead of being cropped.
    const pxPerPage = Math.floor((PAGE_H / imgH) * canvas.height)
    let offset = 0
    let first = true
    while (offset < canvas.height) {
      const sliceH = Math.min(pxPerPage, canvas.height - offset)
      const slice = document.createElement('canvas')
      slice.width = canvas.width
      slice.height = sliceH
      const ctx = slice.getContext('2d')
      if (!ctx) throw new Error('Canvas 2D context unavailable')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, slice.width, slice.height)
      ctx.drawImage(canvas, 0, offset, canvas.width, sliceH, 0, 0, canvas.width, sliceH)

      // A trailing sliver of blank page adds nothing — drop it rather than
      // emitting an empty second sheet.
      if (!first && isBlank(slice)) break

      if (!first) pdf.addPage()
      pdf.addImage(
        slice.toDataURL('image/jpeg', 0.95),
        'JPEG',
        0,
        0,
        imgW,
        (sliceH / canvas.width) * PAGE_W,
      )
      first = false
      offset += sliceH
    }
  }

  pdf.save(filename)
}

/**
 * Text-based PDF via the browser's print dialog. `@media print` in index.css
 * hides everything except the element carrying `data-print-root`.
 */
export function printElement(): void {
  window.print()
}
