import { COMPANY } from '../data/company'

/**
 * Who to expect to deal with, taken from the charter's designation-wise
 * responsibilities (§4). No phone numbers or email addresses are invented —
 * neither source document contains any.
 */
const HANDLED_BY = [
  {
    post: 'CBO',
    what: 'Buyer enquiries, site visits, pricing discussions and the final sale.',
  },
  {
    post: 'CS (Chief Secretary)',
    what: 'Agreements, stamp duty, registration and all documentation.',
  },
  {
    post: 'COO',
    what: 'Anything about construction progress, quality or the site itself.',
  },
  {
    post: 'CFO',
    what: 'Payment schedules, receipts and statements.',
  },
]

export function ContactPage() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Contact</p>
        <h1>
          <span className="grad">Head office</span>
        </h1>
        <p>
          The company operates from Namakkal, Tamil Nadu. Enquiries are routed to the post
          responsible for that part of a project.
        </p>
      </header>

      <section className="section">
        <div className="cards cards--pairs">
          <article className="card">
            <div className="card__head">
              <h3>{COMPANY.legalName}</h3>
            </div>
            <p className="card__body">
              {COMPANY.headOffice}
              <br />
              <span className="muted">{COMPANY.headOfficeTa}</span>
            </p>
          </article>

          <article className="card">
            <div className="card__head">
              <h3>What we do</h3>
            </div>
            <p className="card__body">
              {COMPANY.sector} — buying land, building homes on it, and selling them.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="sechead">
          <p className="eyebrow">Who handles what</p>
          <h2>
            Your enquiry reaches <span className="grad">a named post</span>
          </h2>
          <p>Each of the five board members owns a defined part of a project.</p>
        </div>
        <div className="cards cards--pairs">
          {HANDLED_BY.map((h) => (
            <article className="card" key={h.post}>
              <div className="card__head">
                <h3>{h.post}</h3>
              </div>
              <p className="card__body">{h.what}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="notice">
          The source documents record only the head-office location. Phone, email and registration
          numbers are not stated in them, so they are deliberately left out rather than guessed —
          add them to <code>src/data/company.ts</code> once confirmed.
        </div>
      </section>
    </>
  )
}
