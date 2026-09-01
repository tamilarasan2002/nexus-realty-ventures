/**
 * Single source of truth for the Investment Receipt.
 *
 * Labels are copied verbatim from `முதலீட்டு ரசீது.docx` so the generated
 * PDF matches the original wording exactly. Both the form (ReceiptEditor)
 * and the printable replica (ReceiptDocument) read this schema, so a field
 * can never drift between the two.
 *
 * `mode` decides what the user can do:
 *   'edit'    — free text / date / select input
 *   'locked'  — shown but not editable (fixed company details, boilerplate)
 *   'derived' — computed from other fields, never typed directly
 */

export type FieldMode = 'edit' | 'locked' | 'derived'
export type InputKind = 'text' | 'date' | 'amount' | 'select'

export interface ReceiptField {
  key: ReceiptKey
  /** Exact label text from the source document. */
  label: string
  mode: FieldMode
  input?: InputKind
  options?: string[]
  /** Which table of the original document this row belongs to. */
  table: 'header' | 'body'
  hint?: string
}

export type ReceiptKey =
  | 'companyName'
  | 'receiptNo'
  | 'date'
  | 'projectCode'
  | 'receivedFrom'
  | 'memberType'
  | 'amountFigures'
  | 'amountWords'
  | 'purpose'
  | 'paymentMode'
  | 'transactionRef'
  | 'totalCommitted'
  | 'totalReceived'
  | 'balanceDue'

export const RECEIPT_FIELDS: ReceiptField[] = [
  // ---- Table 1: header block ----
  {
    key: 'companyName',
    label: 'நிறுவனத்தின் பெயர்',
    mode: 'locked',
    table: 'header',
    hint: 'Fixed company name — not editable.',
  },
  { key: 'receiptNo', label: 'ரசீது எண் (Receipt No.)', mode: 'edit', input: 'text', table: 'header' },
  { key: 'date', label: 'தேதி', mode: 'edit', input: 'date', table: 'header' },
  {
    key: 'projectCode',
    label: 'திட்டத்தின் பெயர்/குறியீடு',
    mode: 'edit',
    input: 'text',
    table: 'header',
  },

  // ---- Table 2: body block ----
  {
    key: 'receivedFrom',
    label: 'பெறப்பட்ட நபர் பெயர் (Received From)',
    mode: 'edit',
    input: 'text',
    table: 'body',
  },
  {
    key: 'memberType',
    label: 'வகை (நிரந்தர / கௌரவ உறுப்பினர்)',
    mode: 'edit',
    input: 'select',
    options: ['நிரந்தர உறுப்பினர்', 'கௌரவ உறுப்பினர்'],
    table: 'body',
  },
  {
    key: 'amountFigures',
    label: 'தொகை (எண்களில்)',
    mode: 'edit',
    input: 'amount',
    table: 'body',
    hint: 'Type digits only — the ₹ symbol and grouping are added automatically.',
  },
  {
    key: 'amountWords',
    label: 'தொகை (எழுத்துக்களில்)',
    mode: 'derived',
    table: 'body',
    hint: 'Generated automatically from the amount.',
  },
  {
    key: 'purpose',
    label: 'எதற்காக (நில செலவு / கட்டுமான தவணை நிலை [__] / பிற)',
    mode: 'edit',
    input: 'text',
    table: 'body',
  },
  {
    key: 'paymentMode',
    label: 'பணம் செலுத்திய முறை',
    mode: 'edit',
    input: 'select',
    options: ['Cash', 'UPI', 'Cash / UPI', 'Bank Transfer (NEFT/RTGS/IMPS)', 'Cheque', 'Demand Draft'],
    table: 'body',
  },
  {
    key: 'transactionRef',
    label: 'பரிவர்த்தனை குறிப்பு எண் (Transaction Ref. No.)',
    mode: 'edit',
    input: 'text',
    table: 'body',
  },
  {
    key: 'totalCommitted',
    label: 'இந்த உறுப்பினரால் ஒப்புக்கொள்ளப்பட்ட மொத்த முதலீடு',
    mode: 'edit',
    input: 'amount',
    table: 'body',
  },
  {
    key: 'totalReceived',
    label: 'இந்த உறுப்பினரின் மொத்த முதலீட்டு உறுதியில் இதுவரை பெறப்பட்ட மொத்தம்',
    mode: 'edit',
    input: 'amount',
    table: 'body',
  },
  {
    key: 'balanceDue',
    label: 'மீதமுள்ள நிலுவைத் தொகை',
    mode: 'derived',
    table: 'body',
    hint: 'Total committed − total received so far.',
  },
]

/**
 * The document's signature block prints one line — "CFO கையொப்பம் & நிறுவன
 * முத்திரை" with a "பெயர் & தேதி:" field. Its name and date come from the
 * e-signature rather than from separate form fields, so a receipt can never
 * claim a signatory who has not actually signed it.
 */
export const RECEIPT_SIGNATORY = {
  memberIds: ['cfo'],
  label: 'CFO கையொப்பம் & நிறுவன முத்திரை',
} as const

export type ReceiptData = Record<ReceiptKey, string>

/** Values as they appear in the original document, used as the starting point. */
export const RECEIPT_DEFAULTS: ReceiptData = {
  companyName: 'Nexus Realty Ventures Private Limited',
  receiptNo: 'NRVIR001',
  date: '2026-09-01',
  projectCode: 'NRVP001',
  receivedFrom: '',
  memberType: 'நிரந்தர உறுப்பினர்',
  amountFigures: '10000',
  amountWords: '',
  purpose: 'நில செலவு – முன்பணம்',
  paymentMode: 'Cash / UPI',
  transactionRef: '',
  totalCommitted: '',
  totalReceived: '10000',
  balanceDue: '',
}

/** Fixed boilerplate from the source document. */
export const RECEIPT_STATIC = {
  headOffice: 'HO: Namakkal, TamilNadu, India - 637001',
  titleTa: 'முதலீட்டு ரசீது',
  titleEn: '(INVESTMENT RECEIPT)',
  confirmLine: 'இதன் மூலம் உறுதி செய்யப்படுகிறது:',
  disclaimer:
    '(இந்த ரசீது, முதலீட்டு & லாபப் பகிர்வு ஒப்பந்தம் பிரிவு 2 இன்படி வழங்கப்படுகிறது. இது ஒரு தற்காலிக ஒப்புகை மட்டுமே; இறுதி முதலீட்டு நிலவரம் முதலீட்டுப் பதிவேட்டில் (படிவம் 3) பிரதிபலிக்கும்.)',
  signatureCaption: 'CFO கையொப்பம் & நிறுவன முத்திரை',
} as const
