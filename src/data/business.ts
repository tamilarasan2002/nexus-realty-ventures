/**
 * Buyer-facing description of what the company does.
 *
 * Sourced from the two company documents: the charter's designation-wise
 * responsibilities (§4) and approval matrix (§5), the vision and mission (§2),
 * and the governance policy's construction, land-title and project-annexure
 * provisions (§6, §7, §12).
 *
 * Nothing about completed projects, unit counts, prices, awards or customer
 * testimonials appears in those documents, so none is stated here.
 */
import type { StageKey } from '../components/art/StageIcon'

export const WHAT_WE_DO = {
  headline: 'We buy land, build homes on it, and sell them.',
  lede:
    'Nexus Realty Ventures is a residential real-estate developer based in Namakkal, Tamil Nadu. Each project runs end to end: the land is identified and bought, a contracted builder constructs on it under our supervision, and the finished property is sold and registered to the buyer.',
  pillars: [
    {
      title: 'Land acquisition',
      body: 'Sites are assessed before purchase, then bought and registered with an advocate handling stamp duty and registration.',
    },
    {
      title: 'Construction',
      body: 'Work is carried out under a written construction agreement with a selected contractor, on a stage-linked payment schedule.',
    },
    {
      title: 'Sale and registration',
      body: 'Pricing, buyer verification, the final sale deed and the registration process are handled in-house.',
    },
  ],
}

export interface Stage {
  key: StageKey
  n: number
  title: string
  body: string
  owner: string
}

/** The five stages of a project, mapped to the post accountable for each. */
export const BUILD_STAGES: Stage[] = [
  {
    key: 'land',
    n: 1,
    title: 'Site assessment and land purchase',
    body: 'A site is studied before any money moves. Once the board approves it, the land is bought and registered — the charter requires all five members to sign off on buying land or launching a new project.',
    owner: 'Board · CS handles registration',
  },
  {
    key: 'design',
    n: 2,
    title: 'Project documented before work starts',
    body: 'Each project gets its own annexure recording the total project value and the split between land cost and construction, plus a written construction agreement with the contractor and its payment schedule.',
    owner: 'CS · CFO',
  },
  {
    key: 'build',
    n: 3,
    title: 'Construction under supervision',
    body: 'The contractor builds while the COO runs site supervision, reviews the daily progress report, and coordinates labour and materials. Safety compliance on site sits with the same post.',
    owner: 'COO',
  },
  {
    key: 'inspect',
    n: 4,
    title: 'Stage-wise quality certification',
    body: 'Payments to the contractor are not released on request — each construction stage has to be certified first. That certification is a quality gate, and it needs two signatures, the COO and the CEO.',
    owner: 'COO + CEO',
  },
  {
    key: 'handover',
    n: 5,
    title: 'Sale, deed and registration',
    body: 'Pricing is set within a pre-approved band, buyer KYC is completed, and the final sale deed and registration are coordinated through to handover. A sale price that deviates significantly from budget needs all five members to agree.',
    owner: 'CBO · Board for pricing',
  },
]

/** Trust signals that come from the governance documents, not from marketing. */
export const COMMITMENTS = [
  {
    title: 'No single person can move money',
    body: 'Every bank account operation requires the joint signature of at least two board members, and the policy recommends the CEO and CFO. Opening or closing an account, or changing signatories, needs all five.',
    ref: 'charter §5.1, §5.2 · policy §3',
  },
  {
    title: 'Quality is a payment gate, not a promise',
    body: 'The contractor is paid stage by stage, and each stage must be certified before its payment is released. Poor work stops the money.',
    ref: 'charter §4.4, §5.1',
  },
  {
    title: 'Major decisions need all five members',
    body: 'Buying land, launching a project, selecting or removing a contractor, taking a loan, and settling a final sale price that moves off budget all require unanimous board approval.',
    ref: 'charter §5.2',
  },
  {
    title: 'Everything is written down',
    body: 'The charter commits the company to an honest, fully documented and transparent relationship with every stakeholder — buyers and contractors included. Legal documents, agreements, minutes and a compliance calendar are a named responsibility.',
    ref: 'charter §2, §4.3',
  },
  {
    title: 'Titles are registered properly',
    body: 'Land title and registration are handled with an advocate, and the policy is explicit that ownership and registration are recorded rather than left informal.',
    ref: 'charter §4.3 · policy §7',
  },
  {
    title: 'On time and within budget',
    body: 'Completing every project on time and within budget is written into the company mission, and monitoring deadlines across all projects is the CEO’s named duty.',
    ref: 'charter §2, §4.1',
  },
]

/**
 * Headline figures for the home page. Every one is a fact from the charter or
 * the governance policy — no invented counts, prices or track record.
 */
export const STATS = [
  { n: '5', label: 'Board members accountable' },
  { n: '5', label: 'Stage gates per project' },
  { n: '2+', label: 'Signatures on every payment' },
  { n: '100%', label: 'Documented, by charter' },
]

export interface ProjectPhoto {
  /** Path under public/, e.g. 'images/site-namakkal-01.jpg'. */
  src: string
  alt: string
  caption: string
}

/**
 * Real photographs of the company's own sites. Empty by design — see
 * public/images/README.md. Add entries here and the gallery replaces its
 * drawn placeholders with the photos.
 */
export const PROJECT_PHOTOS: ProjectPhoto[] = []
