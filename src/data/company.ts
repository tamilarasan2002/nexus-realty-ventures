/**
 * Company facts used across the site.
 *
 * Everything here is taken from the two source documents in `public/documents/`
 * and from the company letterhead — nothing is invented. Where the source
 * marks a value as a placeholder or a draft, that is recorded in `caveat` so
 * the site never presents an unsettled value as final.
 */

export const COMPANY = {
  legalName: 'Nexus Realty Ventures Private Limited',
  legalNameTa: 'நெக்ஸஸ் ரியல்டி வென்ச்சர்ஸ் பிரைவேட் லிமிடெட்',
  shortName: 'Nexus Realty Ventures',
  /** From the company letterhead logo. */
  tagline: 'Connected by trust, driven by vision.',
  headOffice: 'Namakkal, Tamil Nadu, India – 637001',
  headOfficeTa: 'நாமக்கல், தமிழ்நாடு, இந்தியா – 637001',
  sector: 'Residential real-estate development',
  /* Contact details, taken from the company's own printed letterhead. */
  phone: '+91 6382 197 033',
  email: 'nexusrealventures@gmail.com',
  website: 'https://nexus-realty-ventures.netlify.app/#/about',
} as const

export interface Caveat {
  /** Shown as an inline notice so draft content is never mistaken for final. */
  text: string
}

/** Charter §2 — VISION & MISSION. */
export const VISION = {
  headingEn: 'Vision & Mission',
  /** Charter §2 states these are an initial draft the board members may revise in full. */
  caveat:
    'The charter records the vision and mission as an initial draft (ஆரம்ப வரைவு) that the five board members may revise in full by unanimous consent.',
  visionTa:
    'தமிழ்நாட்டில் நம்பகத்தன்மை, தரம் மற்றும் வெளிப்படைத்தன்மைக்கு பெயர்பெற்ற, குடியிருப்பு ரியல் எஸ்டேட் மேம்பாட்டில் மக்கள் முதலில் நம்பும் நிறுவனமாக நெக்ஸஸ் ரியல்டி வென்ச்சர்ஸ் வளர வேண்டும்.',
  visionEn:
    'To grow Nexus Realty Ventures into the company people in Tamil Nadu turn to first for residential real-estate development — known for reliability, quality and transparency.',
  missionEn: [
    'Create residential projects that deliver fair value to both investors and buyers, through proper site due diligence and quality construction.',
    'Maintain an honest, fully documented and transparent relationship with every stakeholder — board members, honorary members, customers and contractors.',
    'Achieve stable, sustainable growth by completing every project on time and within budget.',
  ],
} as const

/** Values drawn from the charter's own vision and mission wording (§2). */
export const VALUES = [
  { en: 'Trustworthiness', ta: 'நம்பகத்தன்மை' },
  { en: 'Quality', ta: 'தரம்' },
  { en: 'Transparency', ta: 'வெளிப்படைத்தன்மை' },
  { en: 'Integrity', ta: 'நேர்மை' },
  { en: 'Documentation', ta: 'ஆவணப்படுத்துதல்' },
  { en: 'On time, on budget', ta: 'நேரம் & பட்ஜெட் ஒழுக்கம்' },
] as const

/* ------------------------------------------------------------------
   Leadership — Charter §4 "DESIGNATION-WISE ROLES & RESPONSIBILITIES".
   §4 states the lists are "Not Limited To": each post holder also carries
   out other tasks of the same nature as day-to-day administration needs.
   Governance Policy §3 adds that these are responsibilities only — §9 ties
   every profit share solely to the amount invested, so holding a post
   confers no additional return.
   ------------------------------------------------------------------ */

export interface Role {
  post: string
  summary: string
  duties: string[]
  /** Charter §4's "(Not Limited To)" secondary list for the post. */
  alsoIncludes: string[]
}

export const LEADERSHIP: Role[] = [
  {
    post: 'CEO & Managing Director',
    summary: 'Overall direction and strategy, and the company’s principal point of contact.',
    duties: [
      'Leading the overall direction and strategy of the company',
      'Principal point of contact with contractors, government officials, banks and investors',
      'Chairing board and committee meetings',
      'Exercising the final deciding vote (casting vote) when votes are tied',
      'Monitoring deadlines and overall progress across all projects',
      'Ensuring coordination between the other four designations',
    ],
    alsoIncludes: [
      'Unforeseen crisis management',
      'Final approval of important letters and reports issued for the company',
      'Overall accountability to the honorary members',
    ],
  },
  {
    post: 'CFO',
    summary: 'Financial administration, the investment register and tax compliance.',
    duties: [
      'Managing the bank accounts as a joint signatory authority',
      'Keeping the investment register and financial register updated',
      'Paying instalments to the contractor per the payment schedule',
      'Ensuring TDS and GST compliance',
      'Preparing the financial position report and the final profit/loss distribution statement',
    ],
    alsoIncludes: [
      'Coordinating tax filings',
      'Project budget preparation and expense monitoring',
      'Liaison with the CA / auditor',
    ],
  },
  {
    post: 'CS (Chief Secretary)',
    summary: 'Legal documentation, statutory records and compliance calendar.',
    duties: [
      'Maintaining all legal documents, agreements and records',
      'Maintaining board-meeting minutes and the register of resolutions',
      'Working with the advocate on stamp duty and registration matters',
      'Maintaining the compliance calendar — renewals and filings',
      'Managing documentation for the admission of honorary members',
    ],
    alsoIncludes: [
      'Coordinating replies to legal notices',
      'Document security and maintenance of backup copies',
    ],
  },
  {
    post: 'COO',
    summary: 'Site supervision, construction quality and stage certification.',
    duties: [
      'Site supervision and review of the daily progress report',
      'Communication with the contractor on quality control',
      'Stage-wise certification for release of payments',
      'Coordinating labour and material-logistics issues',
    ],
    alsoIncludes: ['Safety compliance at the site', 'Direct liaison with the site engineer'],
  },
  {
    post: 'CBO',
    summary: 'Marketing, sales strategy and buyer relationships.',
    duties: [
      'Formulating the marketing and sales strategy',
      'Conducting customer meetings and negotiations',
      'Managing social-media and branding activity',
      'Updating the CBO tracker — meetings, posts and follow-ups',
      'Final sales coordination and buyer KYC',
    ],
    alsoIncludes: [
      'Relationship management with marketing vendors',
      'Pricing recommendations — final approval per charter §5',
    ],
  },
]

/* ------------------------------------------------------------------
   Charter §5 — MATTERS REQUIRING JOINT APPROVAL. A practical signing
   matrix that supplements (not replaces) the policy's voting weights.
   ------------------------------------------------------------------ */

export const APPROVAL_MATRIX = [
  {
    tier: 'Two or more members required',
    ref: '§5.1',
    items: [
      'Any withdrawal or transfer of money from the bank account — at least the CFO plus one other',
      'Approval of a day-to-day payment voucher to a contractor or vendor — CFO plus CEO or COO',
      'Appointing a consultant or minor vendor for a specific task',
      'Stage-wise construction certification — COO plus CEO',
      'Formal letters and email sent on company letterhead',
      'Customer price negotiation within a pre-approved band — CBO plus CEO',
      'Minor budget re-allocation within a project, up to a limit left blank in the charter',
    ],
  },
  {
    tier: 'All five members required',
    ref: '§5.2',
    items: [
      'Admitting a new honorary member or investor',
      'Buying land for a new project, or launching a new project',
      'Selecting, appointing or removing a contractor',
      'Opening or closing a bank account, or changing authorised signatories',
      'Amending this charter, the governance policy, or any member’s designation',
      'Removing, replacing or newly adding a board member',
      'Taking a loan or credit facility on behalf of the company',
      'Fixing the final sale price where it deviates significantly from budget',
      'Commencing or settling litigation',
      'Any related-party transaction',
      'Any change in the company’s structure — name, registered office, or LLP/company conversion',
      'Executing any personal guarantee or security deed',
      'Approving the final profit/loss distribution statement',
    ],
  },
]

/** Charter §6 and §7. */
export const CHARTER_PRECEDENCE =
  'The charter is supplementary to, not a substitute for, the Governance & Investment Policy document. For the complete rules on voting weight, honorary-member rights and profit sharing, that document governs — and prevails in the event of any conflict. Amending the charter requires the written consent of all five board members (§7).'

/** The charter is also unexecuted: no member is named in it. */
export const CHARTER_STATUS = {
  isDraft: true,
  notice:
    'The charter is unexecuted. All five member names read “[பெயர்]” ([Name]), the preparation date and effective date are blank placeholders, and no signature or date has been applied in the witness block.',
}

/** Governance Policy §3, closing note. */
export const BANKING_CONTROL =
  'Every bank account operation requires the joint signature of at least two board members — the policy recommends the CEO and the CFO.'

/* ------------------------------------------------------------------
   Governance — from the Governance & Investment Policy document.
   ------------------------------------------------------------------ */

export const MEMBERSHIP = [
  {
    title: 'Board Members',
    ref: '§2.1',
    points: [
      'The five founders. The count of five is fixed.',
      'Responsible for the entire management, financial administration, legal compliance and day-to-day operations.',
      'Adding or removing a board member is possible only through the §10.1 procedure, which requires unanimity — a 3/5 majority is expressly insufficient.',
    ],
  },
  {
    title: 'Honorary Members',
    ref: '§2.2',
    points: [
      'Admitted solely to supply capital to the company’s projects, on a per-project basis.',
      'No direct role in management, financial administration or day-to-day operations.',
      'Rights and share are strictly in proportion to the amount invested.',
      'Land is not registered in their names; their protection is a contractual right to a share of proceeds, not direct property ownership (§7).',
      'Liability is capped at the amount invested (§9.3).',
    ],
  },
]

export const VOTING = [
  {
    tier: 'Board-exclusive matters',
    ref: '§4.1',
    electorate: 'Five board members only',
    weight: 'Consensus, or a majority of at least 3/5',
    note: 'Honorary members have no vote and are not consulted. Covers admitting honorary members, reallocating posts, bank accounts and signatories, contractor selection, appointing advisers, amendments to the policy, litigation, and board-member changes.',
  },
  {
    tier: 'Company-level matters',
    ref: '§4.2',
    electorate: 'Permanent and honorary members',
    weight: 'Weighted 1 : 0.5 — an honorary member’s vote carries half the weight',
    note: 'Company name or branding, corporate structure changes, general policy changes, and running multiple projects simultaneously.',
  },
  {
    tier: 'Project-level matters',
    ref: '§4.3',
    electorate: 'Permanent and honorary members',
    weight: 'Equal 1 : 1 — one person, one vote',
    note: 'Everyone’s money in that project is directly at stake. Covers accepting a new land or project, the final sale price, significant budget variations, and the profit-distribution date.',
  },
]

export const PROFIT_RULE = {
  headline: 'Profit and loss follow the money, not the post.',
  formula: 'share % = member’s investment in the project ÷ total investment in the project',
  points: [
    'A member’s category — permanent or honorary — does not affect their profit share. The invested amount is the only yardstick (§9.1).',
    'Losses are borne by all members in the same proportion, capped at the amount each invested (§9.3).',
    'Profit is computed only after the final sale completes and all costs are deducted, then distributed within 30 days (§9.5).',
    'The management fee in §9.4 is optional and is currently set to zero by default.',
  ],
}

/**
 * The policy document carries its own boxed legal caution, and Annexure-A is
 * entirely unfilled. Both are surfaced on the site rather than hidden, so no
 * one mistakes a draft for settled policy.
 */
export const POLICY_STATUS = {
  isDraft: true,
  notice:
    'This document is an unexecuted draft. The company is not named in it (the field reads “[Company Name]”), no signatures have been applied, and every value in Annexure-A is still a blank placeholder.',
  unfilled: [
    'Winning threshold for company-level decisions (%)',
    'Winning threshold for project-level decisions (%)',
    'Annual interest rate for late payment',
    'Management fee — §9.4 (default 0%)',
    'Seat of arbitration (city)',
  ],
  legalCaution:
    'The policy document itself warns that pooling money from members who have no day-to-day management control may be treated as a Collective Investment Scheme under the SEBI (Collective Investment Schemes) Regulations, 1999, and that operating an unregistered scheme is a punishable offence. It also flags Companies Act, 2013 §42 (private placement) and §§73/76 (deposits). The document states it is not legal advice and that the structure must be reviewed by a qualified Company Secretary or SEBI-registered adviser before any money is collected.',
}
