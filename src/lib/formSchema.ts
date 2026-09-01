/**
 * Shared shape for the management forms.
 *
 * The six templates in `நிறுவன நிர்வாக ஆவணப் படிவங்கள்.pdf` are all the same
 * kind of thing: a titled sheet on company letterhead, some label/value rows,
 * sometimes a ruled table, a note, and a signature block naming specific
 * posts. Describing them as data means one renderer and one editor serve all
 * of them, and a new form is a data entry rather than a new component.
 *
 * Labels are kept exactly as printed so a generated PDF matches its template.
 */

export type FieldKind = 'text' | 'date' | 'amount' | 'select' | 'textarea' | 'derived'

export interface FormField {
  key: string
  /** Printed label, verbatim. */
  label: string
  kind: FieldKind
  options?: string[]
  hint?: string
  default?: string
  /** Computed from the other values; never typed directly. */
  derive?: (values: Record<string, string>) => string
  /** Locked: shown on the form but not editable (fixed company details). */
  locked?: boolean
}

export interface FormColumn {
  key: string
  label: string
  kind: Exclude<FieldKind, 'derived' | 'textarea'>
  /** Percentage of the table width. */
  width?: number
  options?: string[]
}

export interface FormTable {
  key: string
  columns: FormColumn[]
  /**
   * Rows to start with. Every table opens with one and grows via "+ Add row",
   * so a form is never padded with blank rows nobody needs. Where the template
   * prints a closed set of row labels (expense categories, board posts) that
   * column is a select carrying exactly those options.
   */
  rows: number
  /** Optional total row computed by summing an amount column. */
  totalOf?: string
  totalLabel?: string
}

export interface FormSignatory {
  /**
   * Which member posts this line accepts, by id from members.ts. A signature
   * pad appears only for the signed-in member whose id is listed — that is how
   * "only the people the form names may e-sign it" is enforced. Usually one
   * post; form 5's second line reads "CEO/COO", so it accepts either.
   */
  memberIds: string[]
  /** Printed caption under the signature rule, verbatim. */
  label: string
}

export type FormBlock =
  | { type: 'fields'; heading?: string; fields: FormField[] }
  | { type: 'table'; heading?: string; table: FormTable }
  | { type: 'note'; text: string }

export interface FormDefinition {
  id: string
  titleTa: string
  titleEn: string
  /** Page range in the source toolkit PDF, for traceability. */
  sourcePages: string
  /** Intro line printed above the first block. */
  intro?: string
  blocks: FormBlock[]
  signatories: FormSignatory[]
}

export type FormValues = Record<string, string>
/** Table data: table key -> array of rows -> column key -> value. */
export type FormTables = Record<string, FormValues[]>

/** Every editable field across a definition, in document order. */
export function fieldsOf(def: FormDefinition): FormField[] {
  return def.blocks.flatMap((b) => (b.type === 'fields' ? b.fields : []))
}

export function tablesOf(def: FormDefinition): FormTable[] {
  return def.blocks.flatMap((b) => (b.type === 'table' ? [b.table] : []))
}

export function initialValues(def: FormDefinition): FormValues {
  const out: FormValues = {}
  for (const f of fieldsOf(def)) out[f.key] = f.default ?? ''
  return out
}

export function initialTables(def: FormDefinition): FormTables {
  const out: FormTables = {}
  for (const t of tablesOf(def)) {
    out[t.key] = Array.from({ length: t.rows }, () =>
      Object.fromEntries(t.columns.map((c) => [c.key, ''])),
    )
  }
  return out
}

/** Applies every `derive` in order so computed rows stay in step. */
export function resolveValues(def: FormDefinition, values: FormValues): FormValues {
  const out = { ...values }
  for (const f of fieldsOf(def)) {
    if (f.derive) out[f.key] = f.derive(out)
  }
  return out
}
