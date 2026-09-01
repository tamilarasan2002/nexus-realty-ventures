/**
 * Indian-numbering-system amount to English words.
 * Mirrors the phrasing already used in the source receipt:
 * "Rupees Ten Thousand Only".
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(n: number): string {
  if (n < 20) return ONES[n]
  const t = TENS[Math.floor(n / 10)]
  const o = ONES[n % 10]
  return o ? `${t} ${o}` : t
}

/** Converts an integer < 1000 to words. */
function threeDigits(n: number): string {
  const h = Math.floor(n / 100)
  const rest = n % 100
  const parts: string[] = []
  if (h) parts.push(`${ONES[h]} Hundred`)
  if (rest) parts.push(twoDigits(rest))
  return parts.join(' ')
}

/** Strips currency symbols, commas and trailing `/-` from a typed amount. */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[₹,\s]/g, '').replace(/\/-?$/, '')
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

/** `10000` -> `"Rupees Ten Thousand Only"` */
export function amountToWords(value: number | null): string {
  if (value === null) return ''
  if (value === 0) return 'Rupees Zero Only'

  const negative = value < 0
  const abs = Math.abs(value)
  const rupees = Math.floor(abs)
  const paise = Math.round((abs - rupees) * 100)

  const groups: string[] = []
  const crore = Math.floor(rupees / 10000000)
  const lakh = Math.floor((rupees % 10000000) / 100000)
  const thousand = Math.floor((rupees % 100000) / 1000)
  const hundreds = rupees % 1000

  if (crore) groups.push(`${threeDigits(crore % 1000) || twoDigits(crore)} Crore`)
  if (lakh) groups.push(`${twoDigits(lakh)} Lakh`)
  if (thousand) groups.push(`${twoDigits(thousand)} Thousand`)
  if (hundreds) groups.push(threeDigits(hundreds))

  let words = `Rupees ${groups.join(' ')}`
  if (paise) words += ` and ${twoDigits(paise)} Paise`
  words += ' Only'
  return negative ? `Minus ${words}` : words
}

/** `10000` -> `"₹ 10,000/-"` — the format the original receipt uses. */
export function formatRupees(value: number | null): string {
  if (value === null) return '₹ '
  const [int, dec] = Math.abs(value).toFixed(2).split('.')
  // Indian grouping: last 3 digits, then pairs.
  const last3 = int.slice(-3)
  const rest = int.slice(0, -3)
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3
  const sign = value < 0 ? '-' : ''
  return dec === '00' ? `₹ ${sign}${grouped}/-` : `₹ ${sign}${grouped}.${dec}/-`
}
