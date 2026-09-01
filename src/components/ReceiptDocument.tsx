/**
 * Print-accurate replica of `முதலீட்டு ரசீது.docx`.
 *
 * Rendered at a fixed 816 x 1056 px (US Letter at 96 dpi) so both export
 * paths — canvas-to-PDF and the browser print dialog — produce a page that
 * matches the original document's geometry. All measurements are documented
 * against the source OOXML in `src/styles/index.css`.
 */
import type { Ref } from 'react'
import { RECEIPT_FIELDS, RECEIPT_STATIC } from '../lib/receiptSchema'
import type { ReceiptField } from '../lib/receiptSchema'
import type { ReceiptDisplay } from '../lib/receiptDerive'
import { formatDate } from '../lib/receiptDerive'
import type { SignatureEntry } from './FormDocument'
import { asset } from '../lib/asset'

interface Props {
  display: ReceiptDisplay
  /**
   * The CFO's applied e-signature. Absent until someone signs, so an unsigned
   * receipt prints an empty rule rather than a pre-applied scan.
   */
  signature?: SignatureEntry
  /** Marks the subtree the print stylesheet and the PDF exporter target. */
  innerRef?: Ref<HTMLDivElement>
}

function TableRows({ fields, display }: { fields: ReceiptField[]; display: ReceiptDisplay }) {
  return (
    <>
      {fields.map((f) => {
        const value = display[f.key]
        return (
          <tr key={f.key}>
            <th scope="row">{f.label}</th>
            <td className={value ? undefined : 'is-empty'}>{value}</td>
          </tr>
        )
      })}
    </>
  )
}

export function ReceiptDocument({ display, signature, innerRef }: Props) {
  const headerFields = RECEIPT_FIELDS.filter((f) => f.table === 'header')
  const bodyFields = RECEIPT_FIELDS.filter((f) => f.table === 'body')

  return (
    <div className="receipt" ref={innerRef} data-print-root>
      <img className="receipt__logo" src={asset('assets/logo.png')} alt="Nexus Realty Ventures" />
      <p className="receipt__ho">{RECEIPT_STATIC.headOffice}</p>

      <p className="receipt__title">{RECEIPT_STATIC.titleTa}</p>
      <p className="receipt__title-en">{RECEIPT_STATIC.titleEn}</p>

      <table className="receipt-table">
        <colgroup>
          <col className="label" />
          <col className="value" />
        </colgroup>
        <tbody>
          <TableRows fields={headerFields} display={display} />
        </tbody>
      </table>

      <p className="receipt__confirm">{RECEIPT_STATIC.confirmLine}</p>

      <table className="receipt-table">
        <colgroup>
          <col className="label" />
          <col className="value" />
        </colgroup>
        <tbody>
          <TableRows fields={bodyFields} display={display} />
        </tbody>
      </table>

      <p className="receipt__disclaimer">{RECEIPT_STATIC.disclaimer}</p>

      <div className="receipt__sign">
        {signature ? (
          <img className="receipt__sign-img" src={signature.png} alt="CFO signature" />
        ) : (
          <span className="receipt__sign-blank" />
        )}
      </div>
      <p className="receipt__sign-caption">{RECEIPT_STATIC.signatureCaption}</p>
      <p className="receipt__sign-name">
        பெயர் &amp; தேதி:{' '}
        {signature ? `${signature.name} & ${formatDate(signature.dateISO)}` : ''}
      </p>

      <div className="receipt__spacer" />

      {/* The company seal sits in the bottom-right corner of the sheet, clear
          of the signature block on the left. */}
      <img className="doc-seal" src={asset('assets/company-seal.png')} alt="Company seal" />
    </div>
  )
}
