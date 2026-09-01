/**
 * The five board members.
 *
 * The source documents fix the count at five and print the five posts but name
 * nobody — every name field reads "[பெயர்]" ([Name]). The names below were
 * supplied directly by the company, so they are the real officers.
 */

export interface Member {
  /** Stable key; do not change once signatures exist. */
  id: string
  name: string
  /** True while `name` is a stand-in rather than a confirmed person. */
  placeholder: boolean
  /** Post as printed in the charter. */
  post: string
  /**
   * Which signature slot this member occupies in each document.
   * Charter slots follow the printed post order. The policy document prints
   * only "நிரந்தர உறுப்பினர் 1–5", so that mapping is a convention you can
   * reorder here if the members sign in a different order.
   */
  slots: Record<string, string>
}

export const MEMBERS: Member[] = [
  {
    id: 'ceo',
    name: 'Selvakumar Chellappan',
    placeholder: false,
    post: 'CEO & Managing Director',
    slots: { 'company-charter': 'charter-1', 'governance-investment-policy': 'policy-1' },
  },
  {
    id: 'cfo',
    name: 'Subash Thangarasu',
    placeholder: false,
    post: 'CFO',
    slots: { 'company-charter': 'charter-2', 'governance-investment-policy': 'policy-2' },
  },
  {
    id: 'cs',
    name: 'Venkatraman Ramanathan',
    placeholder: false,
    post: 'CS (Chief Secretary)',
    slots: { 'company-charter': 'charter-3', 'governance-investment-policy': 'policy-3' },
  },
  {
    id: 'coo',
    name: 'Selvakumar Selvarasu',
    placeholder: false,
    post: 'COO',
    slots: { 'company-charter': 'charter-4', 'governance-investment-policy': 'policy-4' },
  },
  {
    id: 'cbo',
    name: 'Yoheswaran Pushparaj',
    placeholder: false,
    post: 'CBO',
    slots: { 'company-charter': 'charter-5', 'governance-investment-policy': 'policy-5' },
  },
]

/** The member who owns a given signature slot in a given document. */
export function memberForSlot(docId: string, slotId: string): Member | undefined {
  return MEMBERS.find((m) => m.slots[docId] === slotId)
}

export function slotForMember(member: Member, docId: string): string | undefined {
  return member.slots[docId]
}

/** True while any member name is still a stand-in. */
export const HAS_PLACEHOLDER_NAMES = MEMBERS.some((m) => m.placeholder)
