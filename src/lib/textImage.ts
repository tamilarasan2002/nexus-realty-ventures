/**
 * Renders a string to a transparent PNG using the browser's own text engine.
 *
 * pdf-lib can only draw text with fonts it embeds, and neither its standard
 * fonts nor a plain TTF embed perform the glyph reordering Tamil needs — a
 * name like "நிரந்தர உறுப்பினர்" would come out with broken clusters. Letting
 * Canvas rasterise the text sidesteps that completely: the browser shapes it
 * correctly and pdf-lib just places the resulting image.
 */

export interface TextImage {
  dataUrl: string
  /** Intended size in PDF points (1pt = 1px at scale 1). */
  width: number
  height: number
  /**
   * Distance from the bottom edge of the bitmap up to the text baseline, in
   * points. pdf-lib positions an image by its bottom edge, so subtracting
   * this from a target baseline lands the text exactly on a printed rule —
   * no eyeballed fudge factor.
   */
  baselineFromBottom: number
}

export interface TextImageOptions {
  fontSize?: number
  bold?: boolean
  color?: string
  /** Supersampling factor; 4 keeps small text crisp at print resolution. */
  scale?: number
}

const FONT_STACK = '"Noto Sans Tamil", "Nirmala UI", sans-serif'

export async function textToPng(
  text: string,
  { fontSize = 10, bold = false, color = '#111111', scale = 4 }: TextImageOptions = {},
): Promise<TextImage | null> {
  const trimmed = text.trim()
  if (!trimmed) return null

  if (document.fonts?.ready) await document.fonts.ready

  const font = `${bold ? '700 ' : ''}${fontSize * scale}px ${FONT_STACK}`

  // Measure first on a throwaway context.
  const probe = document.createElement('canvas').getContext('2d')
  if (!probe) return null
  probe.font = font
  const metrics = probe.measureText(trimmed)

  // Tamil vowel signs and subscripts overshoot the em box, so size the bitmap
  // from the reported ascent/descent rather than assuming fontSize.
  const ascent = metrics.actualBoundingBoxAscent || fontSize * scale * 0.8
  const descent = metrics.actualBoundingBoxDescent || fontSize * scale * 0.3
  const padding = Math.ceil(fontSize * scale * 0.15)

  const w = Math.ceil(metrics.width) + padding * 2
  const h = Math.ceil(ascent + descent) + padding * 2

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.font = font
  ctx.fillStyle = color
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(trimmed, padding, padding + ascent)

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: w / scale,
    height: h / scale,
    // Baseline sits `padding + ascent` below the top, so this far above bottom.
    baselineFromBottom: (h - padding - ascent) / scale,
  }
}

/**
 * Crops a signature canvas down to the drawn ink so the stamp has no dead
 * margin, then returns it as a PNG. Returns null when nothing was drawn.
 */
export function trimCanvasToPng(canvas: HTMLCanvasElement): TextImage | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const { width, height } = canvas
  const { data } = ctx.getImageData(0, 0, width, height)

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return null

  const pad = 4
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(width - 1, maxX + pad)
  maxY = Math.min(height - 1, maxY + pad)

  const w = maxX - minX + 1
  const h = maxY - minY + 1
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const octx = out.getContext('2d')
  if (!octx) return null
  octx.drawImage(canvas, minX, minY, w, h, 0, 0, w, h)

  return { dataUrl: out.toDataURL('image/png'), width: w, height: h, baselineFromBottom: 0 }
}
