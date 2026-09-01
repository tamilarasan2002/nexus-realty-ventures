/**
 * Static document manifest.
 *
 * Every file listed here lives in `public/documents/`, so it is copied into
 * `dist/` at build time and served as a plain static asset — no backend.
 *
 * To add the remaining documents: drop the file into `public/documents/` and
 * append an entry below. `kind: 'view'` renders in the PDF viewer;
 * `kind: 'edit'` routes to the receipt editor.
 */

export type DocumentKind = 'view' | 'edit'

/**
 * Which access level a document needs.
 *   'company' — the two governing documents; anyone with the portal code.
 *   'admin'   — everything in the admin area; the five board members only.
 */
export type DocumentGroup = 'company' | 'admin'

/**
 * Sub-sections of the admin area. The Admin documents tab shows one card per
 * category, and opening a card lists that category's documents.
 */
export type AdminCategory = 'administrative' | 'project' | 'investor'

export interface AdminCategoryMeta {
  id: AdminCategory
  label: string
  blurb: string
  icon: string
}

export const ADMIN_CATEGORIES: AdminCategoryMeta[] = [
  {
    id: 'administrative',
    label: 'Administrative documents',
    blurb:
      'The day-to-day management forms — receipts, registers, minutes, vouchers and the final distribution statement.',
    icon: '🗂',
  },
  {
    id: 'project',
    label: 'Project documents',
    blurb:
      'Per-project paperwork: the construction agreement, the project annexure and the fund-raising document.',
    icon: '🏗',
  },
  {
    id: 'investor',
    label: 'Investor documents',
    blurb:
      'What an investing member signs: the investment and profit-sharing agreement, and the security assurance.',
    icon: '🤝',
  },
]

export interface DocumentMeta {
  id: string
  titleTa: string
  titleEn: string
  kind: DocumentKind
  /**
   * True when the document also has a fillable particulars form. Prose
   * contracts open in the viewer for reading and e-signing the original, and
   * separately offer a form for the blanks they ask to be completed.
   */
  hasForm?: boolean
  group: DocumentGroup
  /**
   * Which admin sub-section the document belongs to. Required when group is
   * 'admin'; ignored otherwise. Distinct from `category`, which is only the
   * short label shown on the card chip.
   */
  section?: AdminCategory
  /** Path relative to the site root (files under `public/`). */
  file: string
  /** Original filename, shown on the card and used for downloads. */
  originalName: string
  pages?: number
  /** One-line description shown on the card (English UI copy). */
  summaryTa: string
  category: string
}

export const DOCUMENTS: DocumentMeta[] = [
  {
    id: 'company-charter',
    titleTa: 'நிறுவன பட்டயம் மற்றும் பொறுப்பு நியமன ஆவணம்',
    titleEn: 'Company Charter & Designation of Responsibilities',
    kind: 'view',
    group: 'company',
    file: 'documents/company-charter.pdf',
    originalName: 'நிறுவன பட்டயம் மற்றும் பொறுப்பு நியமன ஆவணம்.pdf',
    pages: 7,
    summaryTa:
      'Company identity, vision and mission, and the responsibilities assigned to each of the five board members.',
    category: 'Charter',
  },
  {
    id: 'governance-investment-policy',
    titleTa: 'நிறுவன நிர்வாகம் மற்றும் முதலீட்டுக் கொள்கை ஆவணம்',
    titleEn: 'Company Governance & Investment Policy',
    kind: 'view',
    group: 'company',
    file: 'documents/governance-investment-policy.pdf',
    originalName: 'நிறுவன நிர்வாகம் மற்றும் முதலீட்டுக் கொள்கை ஆவணம்.pdf',
    pages: 11,
    summaryTa:
      'Rights, decision-making authority, investment rules and profit/loss sharing between the five board members and the honorary members.',
    category: 'Policy',
  },
  {
    id: 'investment-receipt',
    titleTa: 'முதலீட்டு ரசீது',
    titleEn: 'Investment Receipt',
    kind: 'edit',
    group: 'admin',
    section: 'administrative',
    // The source .docx ships alongside the app so the original is always
    // downloadable for reference; the editor itself renders a faithful replica.
    file: 'documents/investment-receipt-source.docx',
    originalName: 'முதலீட்டு ரசீது.docx',
    summaryTa:
      'Provisional acknowledgement for an investment received from a member. Fill in the details and download it as a PDF.',
    category: 'Form 1',
  },
]

/**
 * Forms 2–6 of the management toolkit. They share one source PDF (the toolkit),
 * and each is rendered from its definition in ./forms.ts. Form 1 of the toolkit
 * is the Investment Receipt above, which has its own .docx-accurate build.
 */
const TOOLKIT = 'documents/management-forms-toolkit.pdf'
const TOOLKIT_NAME = 'நிறுவன நிர்வாக ஆவணப் படிவங்கள்.pdf'

const TOOLKIT_FORMS: DocumentMeta[] = [
  {
    id: 'project-financial-status',
    titleTa: 'திட்ட நிதி நிலவரம் அறிக்கை',
    titleEn: 'Project Financial Status Report',
    kind: 'edit',
    group: 'admin',
    section: 'administrative',
    file: TOOLKIT,
    originalName: TOOLKIT_NAME,
    summaryTa:
      'Capital position, expenditure against budget, construction progress and pending items. Issued on an honorary member’s request. Signed by the CFO.',
    category: 'Form 2',
  },
  {
    id: 'investment-register',
    titleTa: 'முதலீட்டுப் பதிவேடு',
    titleEn: 'Investment Register — Master Ledger',
    kind: 'edit',
    group: 'admin',
    section: 'administrative',
    file: TOOLKIT,
    originalName: TOOLKIT_NAME,
    summaryTa:
      'Continuous per-project ledger of every member’s commitment, receipts to date and outstanding balance. The template prints no signature block.',
    category: 'Form 3',
  },
  {
    id: 'board-minutes',
    titleTa: 'குழுக் கூட்ட நிமிடங்கள் / தீர்மானப் படிவம்',
    titleEn: 'Board Meeting Minutes / Resolution',
    kind: 'edit',
    group: 'admin',
    section: 'administrative',
    file: TOOLKIT,
    originalName: TOOLKIT_NAME,
    summaryTa:
      'Attendance, agenda, resolution and voting record, and action items. Signed by the CS as recorder and confirmed by the CEO.',
    category: 'Form 4',
  },
  {
    id: 'payment-voucher',
    titleTa: 'செலவு/கட்டணச் சான்று',
    titleEn: 'Payment / Expense Voucher',
    kind: 'edit',
    group: 'admin',
    section: 'administrative',
    file: TOOLKIT,
    originalName: TOOLKIT_NAME,
    summaryTa:
      'Authorises a payment to a contractor, vendor or service provider against a budget head. Signed by the CFO plus a second authorising signature from the CEO or COO.',
    category: 'Form 5',
  },
  {
    id: 'profit-loss-statement',
    titleTa: 'லாப/நஷ்டப் பகிர்வு இறுதி அறிக்கை',
    titleEn: 'Final Profit/Loss Distribution Statement',
    kind: 'edit',
    group: 'admin',
    section: 'administrative',
    file: TOOLKIT,
    originalName: TOOLKIT_NAME,
    summaryTa:
      'Total cost, net profit or loss, and the member-wise distribution after a sale completes. Prepared by the CFO and approved by the CEO.',
    category: 'Form 6',
  },
]

DOCUMENTS.push(...TOOLKIT_FORMS)

/**
 * Project and investor documents, from the two supplied archives.
 *
 * These are prose contracts rather than single-page templates, so they open in
 * the PDF viewer and are e-signed by stamping onto the original — the contract
 * text is never re-typeset, and so can never drift from the executed wording.
 */
const CONTRACTS: DocumentMeta[] = [
  {
    id: 'construction-mou',
    hasForm: true,
    titleTa: 'கட்டுமானப் புரிந்துணர்வு ஒப்பந்தம்',
    titleEn: 'Construction Agreement',
    kind: 'view',
    group: 'admin',
    section: 'project',
    file: 'documents/project/கட்டுமானப் புரிந்துணர்வு ஒப்பந்தம்.pdf',
    originalName: 'கட்டுமானப் புரிந்துணர்வு ஒப்பந்தம்.pdf',
    pages: 13,
    summaryTa:
      '24 clauses covering scope, cost, quality, delay and termination, with schedules for the property, specifications and stage payments. Signed by the five owners and the contractor.',
    category: 'Contract',
  },
  {
    id: 'project-annexure',
    hasForm: true,
    titleTa: 'திட்ட இணைப்பு',
    titleEn: 'Project Annexure',
    kind: 'view',
    group: 'admin',
    section: 'project',
    file: 'documents/project/திட்ட இணைப்பு.pdf',
    originalName: 'திட்ட இணைப்பு.pdf',
    pages: 5,
    summaryTa:
      'Per-project record of land, financials, member-wise investment, payment stages, voting thresholds and milestones. Approved by all five posts under policy clause 4.3.',
    category: 'Annexure',
  },
  {
    id: 'project-funding',
    hasForm: true,
    titleTa: 'திட்ட நிதி திரட்டல் ஆவணம்',
    titleEn: 'Project Fund Mobilization',
    kind: 'view',
    group: 'admin',
    section: 'project',
    file: 'documents/project/திட்ட நிதி திரட்டல் ஆவணம்.pdf',
    originalName: 'திட்ட நிதி திரட்டல் ஆவணம்.pdf',
    pages: 6,
    summaryTa:
      'Two-stage capital plan: the members’ own contribution, then the balance raised from honorary members. Charter clause 5.2 requires all five signatures before money may be collected.',
    category: 'Funding',
  },
  {
    id: 'investment-agreement',
    hasForm: true,
    titleTa: 'முதலீடு மற்றும் லாபப் பகிர்வு ஒப்பந்தம்',
    titleEn: 'Investment & Profit-Sharing Agreement',
    kind: 'view',
    group: 'admin',
    section: 'investor',
    file: 'documents/investor/முதலீடு மற்றும் லாபப் பகிர்வு ஒப்பந்தம்..pdf',
    originalName: 'முதலீடு மற்றும் லாபப் பகிர்வு ஒப்பந்தம்..pdf',
    pages: 9,
    summaryTa:
      'What an investing honorary member signs: amount and payment schedule, profit and loss sharing, risk acknowledgement, rights and restrictions. Signed by the CEO, the CFO and the investor.',
    category: 'Agreement',
  },
  {
    id: 'guarantee-deed',
    hasForm: true,
    titleTa: 'பாதுகாப்பு உத்தரவாத ஆவணம்',
    titleEn: 'Security & Personal Guarantee Deed',
    kind: 'view',
    group: 'admin',
    section: 'investor',
    file: 'documents/investor/பாதுகாப்பு உத்தரவாத ஆவணம்.pdf',
    originalName: 'பாதுகாப்பு உத்தரவாத ஆவணம்.pdf',
    pages: 10,
    summaryTa:
      'A personal guarantee of the investor’s principal — not a company guarantee. The five members sign in their personal capacity, jointly and severally, alongside the beneficiary.',
    category: 'Guarantee',
  },
]

DOCUMENTS.push(...CONTRACTS)

export function getDocument(id: string): DocumentMeta | undefined {
  return DOCUMENTS.find((d) => d.id === id)
}

export function documentsInGroup(group: DocumentGroup): DocumentMeta[] {
  return DOCUMENTS.filter((d) => d.group === group)
}

export function documentsInSection(section: AdminCategory): DocumentMeta[] {
  return DOCUMENTS.filter((d) => d.group === 'admin' && d.section === section)
}
