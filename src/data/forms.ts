/**
 * The five management-form templates from
 * `நிறுவன நிர்வாக ஆவணப் படிவங்கள்.pdf` (COMPANY MANAGEMENT FORMS TOOLKIT).
 *
 * Form 1 of the toolkit is the Investment Receipt, which already has its own
 * pixel-accurate implementation built from the source .docx — so it is not
 * duplicated here. Forms 2 to 6 are described as data and rendered by the
 * shared FormDocument / FormEditor pair.
 *
 * Labels are the template's own wording. Signatory lists are exactly the
 * signature lines each template prints — no line has been added. Note that
 * Form 3 prints no signature block at all, and the CBO is not a signatory on
 * any form.
 */
import type { FormDefinition } from '../lib/formSchema'
import { shareOf, subtract } from '../lib/formSchema'
import { formatRupees, parseAmount } from '../lib/amountWords'

/** Sums a set of amount fields and formats the result as the templates do. */
const sumOf =
  (keys: string[]) =>
  (v: Record<string, string>): string => {
    const nums = keys.map((k) => parseAmount(v[k] ?? ''))
    if (nums.every((n) => n === null)) return '₹ '
    return formatRupees(nums.reduce<number>((a, n) => a + (n ?? 0), 0))
  }

/* ------------------------------------------------------------------ */

const financialStatus: FormDefinition = {
  id: 'project-financial-status',
  titleTa: 'திட்ட நிதி நிலவரம் அறிக்கை',
  titleEn: '(PROJECT FINANCIAL STATUS REPORT — ON DEMAND)',
  sourcePages: 'p. 3',
  blocks: [
    {
      type: 'fields',
      fields: [
        { key: 'projectCode', label: 'திட்டத்தின் பெயர்/குறியீடு', kind: 'text' },
        { key: 'reportDate', label: 'அறிக்கை தேதி', kind: 'date' },
        { key: 'periodFrom', label: 'அறிக்கை காலம் (Reporting Period) — முதல்', kind: 'date' },
        { key: 'periodTo', label: 'அறிக்கை காலம் (Reporting Period) — வரை', kind: 'date' },
        { key: 'preparedBy', label: 'தயாரித்தவர் — CFO', kind: 'text' },
        { key: 'reviewedBy', label: 'ஆய்வு செய்தவர் — CEO', kind: 'text' },
      ],
    },
    {
      type: 'fields',
      heading: '(அ) மூலதன நிலவரம் (Capital Position)',
      fields: [
        { key: 'totalValue', label: 'திட்டத்தின் மொத்த மதிப்பு', kind: 'amount' },
        { key: 'receivedToDate', label: 'இதுவரை பெறப்பட்ட மொத்த முதலீடு', kind: 'amount' },
        {
          key: 'receivedPct',
          label: 'இதுவரை பெறப்பட்ட முதலீடு (%)',
          kind: 'derived',
          derive: (v) => {
            const t = parseAmount(v.totalValue ?? '')
            const r = parseAmount(v.receivedToDate ?? '')
            if (!t || r === null) return '—'
            return `${((r / t) * 100).toFixed(1)}%`
          },
        },
        {
          key: 'outstanding',
          label: 'நிலுவையில் உள்ள முதலீடு (உறுப்பினர்களிடமிருந்து பெற வேண்டியது)',
          kind: 'derived',
          derive: (v) => {
            const t = parseAmount(v.totalValue ?? '')
            const r = parseAmount(v.receivedToDate ?? '')
            if (t === null || r === null) return '₹ '
            return formatRupees(t - r)
          },
        },
      ],
    },
    {
      type: 'table',
      heading: '(ஆ) செலவு நிலவரம் (Expenditure Position)',
      table: {
        key: 'expenditure',
        columns: [
          {
            key: 'type',
            label: 'செலவு வகை',
            kind: 'select',
            width: 34,
            // The four expense categories the template prints.
            options: [
              'நில செலவு',
              'கட்டுமான செலவு',
              'மார்க்கெட்டிங்/விற்பனை செலவு',
              'சட்ட/தணிக்கை/பிற செலவு',
            ],
          },
          { key: 'budget', label: 'பட்ஜெட் (Budget)', kind: 'amount', width: 22 },
          { key: 'spent', label: 'இதுவரை செலவு', kind: 'amount', width: 22 },
          { key: 'balance', label: 'மீதி', kind: 'amount', width: 22, derive: subtract('budget', 'spent') },
        ],
        rows: 1,
        totalOf: 'budget',
        totalLabel: 'மொத்தம்',
      },
    },
    {
      type: 'fields',
      heading: '(இ) கட்டுமான நிலை (Construction Progress)',
      fields: [
        { key: 'stage', label: 'தற்போதைய நிலை (Schedule-C இன்படி)', kind: 'text' },
        { key: 'completionPct', label: 'நிறைவு % (ஒப்பந்தக்காரர் மதிப்பீடு)', kind: 'text' },
        { key: 'expectedDate', label: 'எதிர்பார்க்கப்படும் நிறைவு தேதி', kind: 'date' },
        { key: 'plannedDate', label: 'திட்டமிட்ட நிறைவு தேதி', kind: 'date' },
        { key: 'delayReason', label: 'தாமதம் ஏதேனும் இருந்தால், காரணம்', kind: 'textarea' },
      ],
    },
    {
      type: 'fields',
      heading: '(ஈ) நிலுவைகள் (Pending Items)',
      fields: [
        {
          key: 'memberDues',
          label: 'உறுப்பினர்களிடமிருந்து நிலுவையில் உள்ள தவணைகள்',
          kind: 'textarea',
        },
        {
          key: 'nextInstalment',
          label: 'ஒப்பந்தக்காரருக்கு செலுத்த வேண்டிய அடுத்த தவணை',
          kind: 'amount',
        },
        {
          key: 'nextInstalmentStage',
          label: 'எந்த நிலை நிறைவடைந்தவுடன்',
          kind: 'text',
        },
      ],
    },
    {
      type: 'note',
      text: '(இந்த அறிக்கை, முதலீடு & லாபப் பகிர்வு ஒப்பந்தம் பிரிவு 6 இன்படி, கௌரவ உறுப்பினர் கோரிக்கையின் பேரில் (ஆண்டுக்கு இருமுறைக்கு மேற்படாமல்) வழங்கப்படுகிறது.)',
    },
  ],
  signatories: [{ memberIds: ['cfo'], label: 'CFO கையொப்பம்' }],
}

/* ------------------------------------------------------------------ */

const investmentRegister: FormDefinition = {
  id: 'investment-register',
  titleTa: 'முதலீட்டுப் பதிவேடு',
  titleEn: '(INVESTMENT REGISTER — MASTER LEDGER)',
  sourcePages: 'p. 5',
  blocks: [
    {
      type: 'note',
      text: '(இது ஒரு தொடர்ச்சியான உள் பதிவேடு. ஒவ்வொரு திட்டத்திற்கும் தனி பதிவேடு பராமரிக்கப்பட வேண்டும். CFO இந்த பதிவேட்டை புதுப்பித்துக்கொண்டே இருக்க வேண்டும், மேலும் ஒவ்வொரு காலாண்டிலும் அனைத்து உறுப்பினர்களுக்கும் சுருக்கம் அனுப்பப்பட வேண்டும்.)',
    },
    {
      type: 'fields',
      fields: [
        { key: 'projectCode', label: 'திட்டத்தின் பெயர்/குறியீடு', kind: 'text' },
        { key: 'updatedOn', label: 'பதிவேடு புதுப்பிக்கப்பட்ட தேதி', kind: 'date' },
      ],
    },
    {
      type: 'table',
      table: {
        key: 'ledger',
        columns: [
          { key: 'name', label: 'உறுப்பினர் பெயர்', kind: 'text', width: 26 },
          {
            key: 'category',
            label: 'வகை',
            kind: 'select',
            width: 16,
            options: ['நிரந்தர', 'கௌரவ உறுப்பினர்'],
          },
          { key: 'commitment', label: 'மொத்த உறுதி', kind: 'amount', width: 16 },
          { key: 'received', label: 'இதுவரை பெற்றது', kind: 'amount', width: 16 },
          { key: 'outstanding', label: 'நிலுவை', kind: 'amount', width: 14, derive: subtract('commitment', 'received') },
          { key: 'lastReceipt', label: 'கடைசி ரசீது எண்', kind: 'text', width: 12 },
        ],
        // Open-ended: the template's note says to extend rows as needed.
        rows: 1,
        totalOf: 'received',
        totalLabel: 'மொத்தம்',
      },
    },
    {
      type: 'note',
      text: '(வரிசைகள் தேவைக்கேற்ப நீட்டிக்கவும். ஒவ்வொரு "இதுவரை பெற்றது" தொகைக்கும், தொடர்புடைய ரசீது (படிவம் 1) பதிவு செய்யப்பட்டிருக்க வேண்டும்.)',
    },
  ],
  // The template prints no signature block at all.
  signatories: [],
}

/* ------------------------------------------------------------------ */

const boardMinutes: FormDefinition = {
  id: 'board-minutes',
  titleTa: 'குழுக் கூட்ட நிமிடங்கள் / தீர்மானப் படிவம்',
  titleEn: '(BOARD MEETING MINUTES / RESOLUTION FORMAT)',
  sourcePages: 'p. 6',
  blocks: [
    {
      type: 'fields',
      fields: [
        { key: 'meetingNo', label: 'கூட்டம் எண்', kind: 'text' },
        { key: 'dateTime', label: 'தேதி & நேரம்', kind: 'text' },
        {
          key: 'venue',
          label: 'இடம் (நேரடி/ஆன்லைன்)',
          kind: 'select',
          options: ['நேரடி', 'ஆன்லைன்'],
        },
        { key: 'chairedBy', label: 'தலைமை தாங்கியவர் — CEO', kind: 'text' },
        { key: 'recordedBy', label: 'நிமிடங்கள் பதிவு செய்தவர் — CS', kind: 'text' },
      ],
    },
    {
      type: 'table',
      heading: 'கலந்துகொண்டோர் (Attendance)',
      table: {
        key: 'attendance',
        columns: [
          {
            key: 'post',
            label: 'பதவி',
            kind: 'select',
            width: 22,
            options: ['CEO & MD', 'CFO', 'CS', 'COO', 'CBO'],
          },
          { key: 'name', label: 'பெயர்', kind: 'text', width: 30 },
          {
            key: 'present',
            label: 'வருகை (பங்கேற்றார்/இல்லை)',
            kind: 'select',
            width: 24,
            options: ['பங்கேற்றார்', 'இல்லை'],
          },
          { key: 'remarks', label: 'குறிப்பு', kind: 'text', width: 24 },
        ],
        rows: 1,
      },
    },
    {
      type: 'fields',
      heading: 'நிகழ்ச்சி நிரல் & விவாதம் (Agenda & Discussion)',
      fields: [
        { key: 'agenda1', label: 'நிகழ்ச்சி நிரல் எண் 1', kind: 'textarea' },
        { key: 'discussion', label: 'விவாத சுருக்கம்', kind: 'textarea' },
      ],
    },
    {
      type: 'fields',
      heading: 'தீர்மானம் & வாக்களிப்பு பதிவு (Resolution & Voting Record)',
      fields: [
        {
          key: 'decisionType',
          label: 'முடிவெடுக்கும் வகை (பிரிவு 4.1/4.2/4.3)',
          kind: 'select',
          options: ['குழு-மட்டும் பிரத்யேகம்', 'நிறுவன-மட்டம்', 'திட்ட-மட்டம்'],
        },
        { key: 'resolution', label: 'தீர்மானம் (Resolution Text)', kind: 'textarea' },
        { key: 'votesFor', label: 'ஆதரவு வாக்குகள் / புள்ளிகள்', kind: 'text' },
        { key: 'votesAgainst', label: 'எதிர் வாக்குகள் / புள்ளிகள்', kind: 'text' },
        { key: 'abstain', label: 'தவிர்த்தவர்கள் (Abstain)', kind: 'text' },
        {
          key: 'outcome',
          label: 'இறுதி முடிவு',
          kind: 'select',
          options: ['நிறைவேற்றப்பட்டது', 'நிராகரிக்கப்பட்டது'],
        },
      ],
    },
    {
      type: 'table',
      heading: 'நடவடிக்கை பட்டியல் (Action Items)',
      table: {
        key: 'actions',
        columns: [
          { key: 'action', label: 'நடவடிக்கை', kind: 'text', width: 46 },
          { key: 'owner', label: 'பொறுப்பு', kind: 'text', width: 28 },
          { key: 'due', label: 'காலக்கெடு', kind: 'date', width: 26 },
        ],
        rows: 1,
      },
    },
  ],
  signatories: [
    { memberIds: ['cs'], label: 'CS கையொப்பம் (நிமிடங்கள் பதிவு செய்தவர்)' },
    { memberIds: ['ceo'], label: 'CEO உறுதிப்படுத்தல்' },
  ],
}

/* ------------------------------------------------------------------ */

const paymentVoucher: FormDefinition = {
  id: 'payment-voucher',
  titleTa: 'செலவு/கட்டணச் சான்று',
  titleEn: '(PAYMENT / EXPENSE VOUCHER)',
  sourcePages: 'p. 8',
  blocks: [
    {
      type: 'fields',
      fields: [
        { key: 'voucherNo', label: 'சான்று எண் (Voucher No.)', kind: 'text' },
        { key: 'date', label: 'தேதி', kind: 'date' },
        { key: 'projectCode', label: 'திட்டத்தின் பெயர்/குறியீடு', kind: 'text' },
        { key: 'paidTo', label: 'செலுத்தப்படுபவர் (Paid To)', kind: 'text' },
        {
          key: 'payeeType',
          label: 'செலுத்தப்படுபவர் வகை',
          kind: 'select',
          options: ['ஒப்பந்தக்காரர்', 'விற்பனையாளர்', 'சேவை வழங்குநர்'],
        },
        { key: 'amount', label: 'தொகை', kind: 'amount' },
        { key: 'purpose', label: 'எதற்காக (Purpose/Description)', kind: 'textarea' },
        {
          key: 'budgetHead',
          label: 'பட்ஜெட் தலைப்பு (Budget Head)',
          kind: 'select',
          options: ['நில', 'கட்டுமானம்', 'மார்க்கெட்டிங்', 'சட்டம்', 'பிற'],
        },
        { key: 'billRef', label: 'ஆதார ஆவணம் (Invoice/Bill Ref. No.)', kind: 'text' },
        {
          key: 'paymentMode',
          label: 'பணம் செலுத்திய முறை',
          kind: 'select',
          // The voucher deliberately omits cash, unlike the receipt.
          options: ['காசோலை', 'NEFT', 'UPI'],
        },
        {
          key: 'approvedBy',
          label: 'ஒப்புதல் அளித்தவர் (பிரிவு 4.1 இன்படி)',
          kind: 'textarea',
        },
      ],
    },
    {
      type: 'note',
      text: '(கொள்கை ஆவணம் பிரிவு 4.1 இன்படி, ஒப்பந்தக்காரர்-தொடர்பான செலவுகள் "குழு-மட்டும் பிரத்யேக முடிவுகள்" ஆகும்; எனவே இந்த சான்று குறைந்தது 3/5 நிரந்தர உறுப்பினர்களால் ஒப்புதல் பெற்றிருக்க வேண்டும்.)',
    },
  ],
  signatories: [
    { memberIds: ['cfo'], label: 'CFO கையொப்பம்' },
    // The template prints one line reading "CEO/COO" — either may sign it.
    { memberIds: ['ceo', 'coo'], label: 'இரண்டாம் அங்கீகார கையொப்பம் (CEO/COO)' },
  ],
}

/* ------------------------------------------------------------------ */

const COST_KEYS = ['landCost', 'buildCost', 'marketingCost', 'legalCost', 'taxCost', 'otherCost']

const profitLoss: FormDefinition = {
  id: 'profit-loss-statement',
  titleTa: 'லாப/நஷ்டப் பகிர்வு இறுதி அறிக்கை',
  titleEn: '(FINAL PROFIT/LOSS DISTRIBUTION STATEMENT)',
  sourcePages: 'p. 9–10',
  blocks: [
    {
      type: 'fields',
      fields: [
        { key: 'projectCode', label: 'திட்டத்தின் பெயர்/குறியீடு', kind: 'text' },
        { key: 'soldOn', label: 'கட்டிடம் விற்பனையான தேதி', kind: 'date' },
        { key: 'saleAmount', label: 'இறுதி விற்பனை தொகை', kind: 'amount' },
      ],
    },
    {
      type: 'fields',
      heading: '(அ) மொத்த செலவு கணக்கீடு',
      fields: [
        { key: 'landCost', label: 'நில செலவு', kind: 'amount' },
        { key: 'buildCost', label: 'கட்டுமான செலவு', kind: 'amount' },
        { key: 'marketingCost', label: 'மார்க்கெட்டிங்/தரகு செலவு', kind: 'amount' },
        {
          key: 'legalCost',
          label: 'சட்ட/பதிவு/முத்திரைத் தீர்வை செலவு',
          kind: 'amount',
        },
        {
          key: 'taxCost',
          label: 'வரி (GST/TDS/மூலதன ஆதாய வரி பொருந்துமிடத்து)',
          kind: 'amount',
        },
        { key: 'otherCost', label: 'பிற செலவுகள்', kind: 'amount' },
        {
          key: 'totalCost',
          label: 'மொத்த செலவு',
          kind: 'derived',
          derive: sumOf(COST_KEYS),
        },
      ],
    },
    {
      type: 'fields',
      heading: '(ஆ) நிகர லாபம் / நஷ்டம்',
      fields: [
        {
          key: 'saleAmountEcho',
          label: 'இறுதி விற்பனை தொகை',
          kind: 'derived',
          derive: (v) => formatRupees(parseAmount(v.saleAmount ?? '')),
        },
        {
          key: 'totalCostEcho',
          label: 'மொத்த செலவு (கழிக்க)',
          kind: 'derived',
          derive: sumOf(COST_KEYS),
        },
        {
          key: 'netProfit',
          label: 'நிகர லாபம் / (நஷ்டம்)',
          kind: 'derived',
          derive: (v) => {
            const sale = parseAmount(v.saleAmount ?? '')
            const cost = COST_KEYS.map((k) => parseAmount(v[k] ?? '') ?? 0).reduce((a, b) => a + b, 0)
            if (sale === null) return '₹ '
            const net = sale - cost
            return net < 0 ? `(${formatRupees(Math.abs(net))})` : formatRupees(net)
          },
        },
      ],
    },
    {
      type: 'table',
      heading: '(இ) உறுப்பினர்வாரியான பகிர்வு',
      table: {
        key: 'distribution',
        columns: [
          { key: 'name', label: 'உறுப்பினர் பெயர்', kind: 'text', width: 26 },
          { key: 'investment', label: 'முதலீடு', kind: 'amount', width: 19 },
          { key: 'ratio', label: 'முதலீட்டு விகிதம்', kind: 'text', width: 17, derive: shareOf('investment') },
          { key: 'share', label: 'லாப/நஷ்டப் பங்கு', kind: 'amount', width: 19 },
          { key: 'payable', label: 'செலுத்த வேண்டிய இறுதித் தொகை', kind: 'amount', width: 19 },
        ],
        rows: 1,
        totalOf: 'investment',
        totalLabel: 'மொத்தம்',
      },
    },
    {
      type: 'note',
      text: '(இந்த அறிக்கை, முதலீடு & லாபப் பகிர்வு ஒப்பந்தம் பிரிவு 4 இன்படி தயாரிக்கப்பட்டு, விற்பனை நிறைவடைந்த 30 நாட்களுக்குள் அனைத்து உறுப்பினர்களுக்கும் அனுப்பப்பட வேண்டும். செலுத்துதல் நிறைவடைந்த பின், ஒவ்வொரு உறுப்பினரும் இந்த அறிக்கையில் "பெறப்பட்டது" என கையொப்பமிட்டு உறுதி செய்ய வேண்டும். ஒவ்வொரு உறுப்பினரின் "பெறப்பட்டது" கையொப்பமும் தனித்தனி பக்கத்தில் பெறப்படலாம்.)',
    },
  ],
  signatories: [
    { memberIds: ['cfo'], label: 'CFO தயாரித்தது' },
    { memberIds: ['ceo'], label: 'CEO அங்கீகாரம்' },
  ],
}

/* ------------------------------------------------------------------ */

import { CONTRACT_FORMS } from './contractForms'

export const FORMS: FormDefinition[] = [
  financialStatus,
  investmentRegister,
  boardMinutes,
  paymentVoucher,
  profitLoss,
  // The project and investor contracts contribute their fillable particulars.
  ...CONTRACT_FORMS,
]

export function getForm(id: string): FormDefinition | undefined {
  return FORMS.find((f) => f.id === id)
}
