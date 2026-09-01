/**
 * New-visitor content, sourced only from the two documents in
 * `public/documents/`. Section references point back to the Governance &
 * Investment Policy document unless noted.
 *
 * Nothing here is promotional. The policy document carries its own legal
 * caution about collective investment schemes, so this content is written as a
 * description of the policy as drafted — not as an offer or an invitation to
 * invest. See POLICY_STATUS in ./company.ts.
 */

export interface Step {
  n: number
  title: string
  detail: string
  ref: string
}

/** The sequence the policy lays out for an honorary member joining a project. */
export const JOINING_STEPS: Step[] = [
  {
    n: 1,
    title: 'The board decides on admission',
    detail:
      'Admitting a new honorary member is a board-exclusive matter. Honorary members have no vote on it, and the charter requires all five board members to approve.',
    ref: '§4.1 · charter §5.2',
  },
  {
    n: 2,
    title: 'You receive and accept this policy in writing',
    detail:
      'A copy of the governance policy must be given to every new honorary member before they join, and accepted under their signature.',
    ref: '§12',
  },
  {
    n: 3,
    title: 'You sign the agreement and the risk acknowledgement',
    detail:
      'Two documents are required before joining: an Investment & Profit-Sharing Agreement, and a written acknowledgement that you have understood the risk disclosure.',
    ref: '§5 · §8',
  },
  {
    n: 4,
    title: 'Your amount goes into the project annexure',
    detail:
      'Each project carries its own annexure recording the total project value, the land and construction cost split, and every member’s investment amount. The amount itself is agreed case by case with the board members — the policy sets no minimum or maximum.',
    ref: '§6',
  },
  {
    n: 5,
    title: 'You pay in two stages',
    detail:
      'The land-cost portion — drafted as 40% — is payable immediately once the decision is taken, for land purchase and registration. The remaining 60% follows the construction contract’s stage-wise payment schedule, with dates set in the project annexure.',
    ref: '§6',
  },
  {
    n: 6,
    title: 'The CFO records it and issues your receipt',
    detail:
      'Every investment is entered in the Investment Register by the CFO, who issues an investment receipt and provides a statement annually or on request.',
    ref: '§6 · charter §4.2',
  },
  {
    n: 7,
    title: 'Profit is distributed after the sale completes',
    detail:
      'Profit is computed only after the final sale is done and all costs are deducted — construction, tax, brokerage. It is then distributed to all members within 30 days, in proportion to what each invested.',
    ref: '§9.1 · §9.5',
  },
  {
    n: 8,
    title: 'Membership ends with the project',
    detail:
      'Once profit or loss is distributed, membership terminates automatically unless you sign a fresh investment agreement for the next project. Membership is per project, not perpetual.',
    ref: '§10.2',
  },
]

/** §8 — the risk disclosure the policy requires every honorary member to accept. */
export const RISKS = [
  {
    title: 'No guaranteed return',
    detail:
      'This is expressly not a guaranteed-return arrangement. Real-estate market conditions, construction delay, sales delay or outright loss are all risks you carry.',
  },
  {
    title: 'No liquidity until the project sells',
    detail:
      'Money cannot be withdrawn while a project is running. It is a long-term, illiquid commitment that ends only when the project is completed and sold.',
  },
  {
    title: 'Losses are shared, not just profits',
    detail:
      'If a project ends in loss, that loss is borne by all members in proportion to their investment — though never beyond the amount invested.',
  },
  {
    title: 'No direct right in the land',
    detail:
      'Land is registered in the board members’ names, or the company’s. An honorary member’s name does not appear on the registration document; the protection is a contractual right to a share of proceeds.',
  },
  {
    title: 'Limited say in management',
    detail:
      'Honorary members have no vote on board-exclusive matters, a half-weight vote on company-level matters, and an equal vote only on project-level matters.',
  },
]

export interface Faq {
  q: string
  a: string
  ref: string
}

/** Questions a first-time visitor would ask, answered strictly from the documents. */
export const FAQ: Faq[] = [
  {
    q: 'Who runs the company?',
    a: 'Five board members, also called board members. The count of five is fixed and holds every management, financial-administration, legal-compliance and day-to-day operational responsibility. Each holds one of five posts: CEO & Managing Director, CFO, CS, COO and CBO.',
    ref: 'policy §2.1 · charter §3, §4',
  },
  {
    q: 'What is the difference between a board member and an honorary member?',
    a: 'Board members run the company. Honorary members are admitted solely to supply capital to a project, have no role in management, and hold rights strictly in proportion to the amount they invested.',
    ref: 'policy §2.1, §2.2',
  },
  {
    q: 'Is a return guaranteed?',
    a: 'No. The risk disclosure states plainly that this is not a guaranteed return, and that market conditions, construction delay, sales delay and loss are all possible.',
    ref: 'policy §8',
  },
  {
    q: 'How much would I need to invest?',
    a: 'The policy sets no minimum and no maximum. The amount is finalised case by case together with the board members and recorded in that project’s annexure.',
    ref: 'policy §6',
  },
  {
    q: 'When can I take my money out?',
    a: 'Not while a project is running — the investment is illiquid until the project is completed and sold. In exceptional circumstances a slot may be transferred to a new investor, but only with prior board approval, and the incoming person must accept the policy and the investment agreement in full.',
    ref: 'policy §10.2',
  },
  {
    q: 'Will the land be registered in my name?',
    a: 'No. Land is registered jointly in the board members’ names, or in the company’s name. An honorary member’s protection is a contractual right to a share of the profit or proceeds, not direct property ownership — and the policy requires this be explained clearly before joining.',
    ref: 'policy §7',
  },
  {
    q: 'How is profit calculated?',
    a: 'Strictly pro rata to what each member invested in that project: share % = your investment ÷ total investment in the project. A member’s category makes no difference — on a ₹50,00,000 total, someone who invested ₹2,50,000 receives 5%.',
    ref: 'policy §9.1, §9.2',
  },
  {
    q: 'What happens if the project loses money?',
    a: 'The loss is shared by all members in the same proportion as profit would have been. No member is obliged to pay anything beyond the amount they invested, unless separately agreed in writing.',
    ref: 'policy §9.3',
  },
  {
    q: 'Is there a management fee?',
    a: 'The policy allows a small percentage of total profit to be allocated to the board members before distribution, but it is not mandatory and the rate is currently set to zero by default. The rate field itself is still blank.',
    ref: 'policy §9.4',
  },
  {
    q: 'Do I get a vote?',
    a: 'It depends on the decision. Board-exclusive matters — admissions, bank accounts, contractor selection, policy amendments — carry no honorary vote at all. Company-level matters carry a half-weight vote. Project-level matters, where your money is directly at stake, carry an equal vote.',
    ref: 'policy §4.1–§4.3',
  },
  {
    q: 'What if I pay an instalment late?',
    a: 'A delay beyond 15 days attracts annual interest, though the rate is still a blank placeholder in the document. If non-payment continues past 30 days the board members may find a replacement investor for that slot, and the defaulting member retains a claim only to what they already paid, without interest.',
    ref: 'policy §6',
  },
  {
    q: 'How are disputes resolved?',
    a: 'Between board members: discussion first, then a board vote, then arbitration under the Arbitration and Conciliation Act, 1996. Between an honorary member and the board: per the arbitration clause in that member’s investment agreement. The seat is in Tamil Nadu; the city is still blank in the document.',
    ref: 'policy §11',
  },
  {
    q: 'Which document governs if two of them disagree?',
    a: 'The Governance & Investment Policy prevails over the charter. And where a project-specific agreement conflicts with the general policy, the project agreement’s terms prevail.',
    ref: 'charter §6 · policy §12',
  },
  {
    q: 'Is this structure legally cleared?',
    a: 'Not yet, on the document’s own account. The policy carries a boxed caution that pooling money from members without day-to-day management control may amount to a Collective Investment Scheme under the SEBI regulations of 1999, that operating one unregistered is a punishable offence, and that Companies Act provisions on private placement and deposits may also apply. It states it is not legal advice and that the structure must be reviewed by a qualified Company Secretary or SEBI-registered adviser before any money is collected.',
    ref: 'policy §1',
  },
]
