/**
 * Signature slot geometry, measured from the source PDFs.
 *
 * Both documents are US Letter (612 x 792 pt) and already print five blank
 * signature blocks on their last page. Coordinates below were extracted with
 * `pdftotext -bbox` and converted from its top-left origin to pdf-lib's
 * bottom-left origin (pdfY = 792 - baselineY), so a stamp lands exactly on
 * the printed rule and beside the printed labels.
 */

export const PAGE_HEIGHT = 792

export interface SignatureSlot {
  id: string
  /** Role as printed in the document. */
  role: string
  /** y of the printed signature rule; the ink sits just above it. */
  ruleY: number
  /** x range of the printed rule — the ink is fitted into this width. */
  ruleX: [number, number]
  /**
   * Where the signer's name goes, just after the printed "பெயர்:" label.
   * Omitted where the template prints no name line — the project annexure
   * gives each signature only a date.
   */
  nameAt?: { x: number; y: number }
  /** Where the date goes, just after the printed date label. */
  dateAt?: { x: number; y: number }
  /**
   * Which member posts may e-sign this line. Empty means the line belongs to
   * someone outside the portal — a contractor, an investor, a witness — so it
   * is left blank for a wet signature rather than offered in the app.
   */
  memberIds?: string[]
  /** Shown instead of a sign button when memberIds is empty. */
  externalNote?: string
}

export interface SignatureLayout {
  /** 0-based page index of the signature page. */
  pageIndex: number
  slots: SignatureSlot[]
  /** Shown above the slot list to explain the block's structure. */
  note?: string
  /**
   * True when the document's printed label asks for a designation alongside
   * the name ("பெயர் & பதவி:"). The charter prints the role itself, so it
   * only needs a name.
   */
  printsDesignation: boolean
}

/**
 * The five posts in the order every template except the construction MoU
 * numbers them. `memberIds` on each slot is the single source of truth for who
 * may e-sign it — there is deliberately no second mapping elsewhere.
 */
export const FIVE_ORDER = ['ceo', 'cfo', 'cs', 'coo', 'cbo'] as const

/** Vertical room between one slot's rule and the label above it. */
export const INK_MAX_HEIGHT = 26
export const INK_GAP = 2

const CHARTER_ROLES = [
  'CEO & Managing Director',
  'CFO',
  'CS (Chief Secretary)',
  'COO',
  'CBO',
]

/**
 * நிறுவன பட்டயம் — page 7 (index 6).
 * Rules at y 610.2 / 540.1 / 470.1 / 400.1 / 330.0; the pitch is a clean 70pt.
 */
const charter: SignatureLayout = {
  pageIndex: 6,
  printsDesignation: false,
  slots: CHARTER_ROLES.map((role, i) => ({
    id: `charter-${i + 1}`,
    role,
    ruleY: 610.2 - i * 70,
    ruleX: [72, 206.6],
    nameAt: { x: 118, y: 583.0 - i * 70 },
    dateAt: { x: 197, y: 568.5 - i * 70 },
    memberIds: [FIVE_ORDER[i]],
  })),
}

/**
 * நிர்வாகம் & முதலீட்டுக் கொள்கை — page 11 (index 10).
 * Rules at y 475.6 / 418.5 / 361.3 / 304.2 / 247.0; the pitch is 57.15pt.
 */
const POLICY_PITCH = 57.15
const policy: SignatureLayout = {
  pageIndex: 10,
  printsDesignation: true,
  slots: Array.from({ length: 5 }, (_, i) => ({
    id: `policy-${i + 1}`,
    role: `நிரந்தர உறுப்பினர் ${i + 1}`,
    ruleY: 475.6 - i * POLICY_PITCH,
    ruleX: [72, 206.6] as [number, number],
    nameAt: { x: 318, y: 461.6 - i * POLICY_PITCH },
    dateAt: { x: 110, y: 446.9 - i * POLICY_PITCH },
    memberIds: [FIVE_ORDER[i]],
  })),
}


/* ==================================================================
   Project and investor documents.

   These are prose contracts, not single-page templates, so their
   signatures are stamped onto the original PDF rather than re-typeset —
   the contract text is never retyped and so can never drift.

   Every y below was measured from the source PDF with `pdftotext -bbox`
   and converted to pdf-lib's bottom-left origin (pdfY = 792 - baselineY).
   Value x positions sit just past the end of each printed label.

   Lines belonging to a contractor, an investor or a witness carry an
   empty `memberIds`: they are not portal users, so those lines stay
   blank for a wet signature.
   ================================================================== */

/** Posts in the order the templates number their five members. */
const POSTS = [
  'CEO & Managing Director',
  'CFO',
  'CS (Chief Secretary)',
  'COO',
  'CBO',
] as const

const FIVE = FIVE_ORDER

/** Post label for a member id, for slot captions. */
function postLabel(id: string): string {
  return POSTS[FIVE.indexOf(id as (typeof FIVE)[number])] ?? id.toUpperCase()
}

/**
 * கட்டுமானப் புரிந்துணர்வு ஒப்பந்தம் — Construction MoU, page 12 (index 11).
 *
 * Five owners (first party) then the contractor (second party). Each line
 * prints Name / Aadhaar / Date & Place; the Aadhaar row is left to the signer.
 *
 * ⚠ The owner order here is NOT the usual CEO→CBO sequence. The document's
 * owners table on page 1 pre-prints the five names, and matching them against
 * the member roster gives: 1 Selvakumar Chellappan (CEO), 2 Yoheswaran
 * Pushparaj (CBO), 3 Selvakumar Selvarasu (COO), 4 Venkatraman Ramanathan
 * (CS), 5 Subash Thangarasu (CFO). Using the default order would let the CFO
 * sign on Yoheswaran's line.
 */
const MOU_OWNERS = ['ceo', 'cbo', 'coo', 'cs', 'cfo'] as const
const constructionMou: SignatureLayout = {
  pageIndex: 11,
  printsDesignation: false,
  note: 'Five owners sign as the first party, then the contractor as the second party. The owner order follows the names pre-printed in the document, which is not the usual CEO-to-CBO sequence. Two witness lines follow on the next page and are signed in person.',
  slots: [
    ...[
      { rule: 633.8, name: 605.1, date: 575.3 },
      { rule: 540.0, name: 511.3, date: 481.6 },
      { rule: 446.2, name: 417.5, date: 387.8 },
      { rule: 352.4, name: 323.8, date: 294.0 },
      { rule: 258.7, name: 230.0, date: 185.2 },
    ].map((pos, i) => ({
      id: `mou-owner-${i + 1}`,
      role: `உரிமையாளர் ${i + 1} — ${postLabel(MOU_OWNERS[i])}`,
      ruleY: pos.rule,
      ruleX: [36, 182.7] as [number, number],
      nameAt: { x: 72, y: pos.name },
      dateAt: { x: 108, y: pos.date },
      memberIds: [MOU_OWNERS[i]],
    })),
    {
      id: 'mou-contractor',
      role: 'ஒப்பந்தக்காரர் — A1 Construction சார்பாக',
      ruleY: 119.9,
      ruleX: [36, 182.7],
      nameAt: { x: 72, y: 91.4 },
      dateAt: { x: 108, y: 61.4 },
      memberIds: [],
      externalNote: 'Signed by the contractor in person',
    },
  ],
}

/**
 * திட்ட இணைப்பு — Project Annexure, page 5 (index 4).
 * Five posts, each with a date line only — the template prints no name field.
 */
const projectAnnexure: SignatureLayout = {
  pageIndex: 4,
  printsDesignation: false,
  note: 'All five posts sign the annexure. The template prints only a date beside each signature, so no name is stamped.',
  slots: [610.2, 554.8, 499.3, 443.9, 388.5].map((rule, i) => ({
    id: `annexure-${i + 1}`,
    role: POSTS[i],
    ruleY: rule,
    ruleX: [72, 206.6] as [number, number],
    dateAt: { x: 110, y: [583.1, 527.7, 472.4, 416.9, 361.5][i] },
    memberIds: [FIVE[i]],
  })),
}

/**
 * திட்ட நிதி திரட்டல் ஆவணம் — Project Fund-Raising, page 5 (index 4).
 * Five posts with name and date. The closing note states the fund-raising
 * process may only begin once all five signatures are in place.
 */
const projectFunding: SignatureLayout = {
  pageIndex: 4,
  printsDesignation: false,
  note: 'The document states that collecting money from honorary members may begin only after all five signatures are in place.',
  slots: [475.8, 404.8, 333.7, 262.7, 191.6].map((rule, i) => ({
    id: `funding-${i + 1}`,
    role: POSTS[i],
    ruleY: rule,
    ruleX: [72, 206.6] as [number, number],
    nameAt: { x: 116, y: [448.8, 377.8, 306.7, 235.6, 164.5][i] },
    dateAt: { x: 110, y: [434.2, 363.1, 292.1, 220.9, 149.9][i] },
    memberIds: [FIVE[i]],
  })),
}

/**
 * பாதுகாப்பு உத்தரவாத ஆவணம் — Security & Personal Guarantee Deed,
 * page 9 (index 8). The five members sign as guarantors in their personal
 * capacity — not as officers — then the beneficiary (the investing honorary
 * member) signs. The beneficiary's PAN and date labels fall on page 10.
 */
const guaranteeDeed: SignatureLayout = {
  pageIndex: 8,
  printsDesignation: false,
  note: 'The five members sign here as guarantors in their personal individual capacity, not as company officers. The beneficiary and the two witnesses sign in person.',
  slots: [
    ...[581.2, 493.8, 406.5, 319.0, 231.6].map((rule, i) => ({
      id: `deed-guarantor-${i + 1}`,
      role: `உத்தரவாதம் அளிப்பவர் ${i + 1} — ${POSTS[i]}`,
      ruleY: rule,
      ruleX: [72, 206.6] as [number, number],
      nameAt: { x: 118, y: [552.5, 465.0, 377.7, 290.2, 202.8][i] },
      dateAt: { x: 153, y: [523.2, 435.8, 348.4, 260.9, 173.5][i] },
      memberIds: [FIVE[i]],
    })),
    {
      id: 'deed-beneficiary',
      role: 'பயனாளி (Beneficiary) — the investing honorary member',
      ruleY: 115.2,
      ruleX: [72, 206.6],
      nameAt: { x: 118, y: 86.4 },
      memberIds: [],
      externalNote: 'Signed by the investor in person',
    },
  ],
}

/**
 * முதலீடு மற்றும் லாபப் பகிர்வு ஒப்பந்தம் — Investment & Profit-Sharing
 * Agreement, page 9 (index 8). The company signs through two officers only;
 * the investor signs their own line.
 */
const investmentAgreement: SignatureLayout = {
  pageIndex: 8,
  printsDesignation: false,
  note: 'The company signs through the CEO & Managing Director and the CFO only — this document prints no individual lines for the other three posts. The investor and witnesses sign in person.',
  slots: [
    {
      id: 'ipa-ceo',
      role: 'CEO & Managing Director சார்பாக',
      ruleY: 577.2,
      ruleX: [72, 206.6],
      nameAt: { x: 118, y: 548.5 },
      dateAt: { x: 153, y: 519.2 },
      memberIds: ['ceo'],
    },
    {
      id: 'ipa-cfo',
      role: 'CFO சார்பாக',
      ruleY: 485.8,
      ruleX: [72, 206.6],
      nameAt: { x: 118, y: 457.0 },
      dateAt: { x: 153, y: 427.7 },
      memberIds: ['cfo'],
    },
    {
      id: 'ipa-investor',
      role: 'முதலீட்டாளர் (Investor)',
      ruleY: 363.5,
      ruleX: [72, 206.6],
      nameAt: { x: 118, y: 334.7 },
      dateAt: { x: 153, y: 305.4 },
      memberIds: [],
      externalNote: 'Signed by the investor in person',
    },
  ],
}

export const SIGNATURE_LAYOUTS: Record<string, SignatureLayout> = {
  'company-charter': charter,
  'governance-investment-policy': policy,
  'construction-mou': constructionMou,
  'project-annexure': projectAnnexure,
  'project-funding': projectFunding,
  'guarantee-deed': guaranteeDeed,
  'investment-agreement': investmentAgreement,
}

export function getLayout(docId: string): SignatureLayout | undefined {
  return SIGNATURE_LAYOUTS[docId]
}
