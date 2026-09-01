import { Link } from 'react-router-dom'
import { BUILD_STAGES, COMMITMENTS } from '../data/business'
import { APPROVAL_MATRIX, BANKING_CONTROL, CHARTER_PRECEDENCE } from '../data/company'
import { StageIcon } from '../components/art/StageIcon'

export function HowWeBuildPage() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">How we build</p>
        <h1>
          Five stages, each with <span className="grad">someone accountable</span>
        </h1>
        <p className="lede">
          Every project runs the same way, and each stage has a named post answerable for it. The
          descriptions below come from the company’s own charter and governance policy rather than
          from a brochure.
        </p>
      </header>

      <section className="section">
        <ol className="stages">
          {BUILD_STAGES.map((s) => (
            <li className="stage" key={s.key}>
              <div className="stage__icon">
                <StageIcon name={s.key} />
              </div>
              <div className="stage__body">
                <h3 className="stage__title">
                  <span className="stage__n">{s.n}</span>
                  {s.title}
                </h3>
                <p className="stage__text">{s.body}</p>
                <p className="stage__owner">Accountable: {s.owner}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2 className="section__title">What keeps it honest</h2>
        <p>
          These are controls written into the company’s governing documents, not assurances added
          for a website.
        </p>
        <div className="cards cards--2">
          {COMMITMENTS.map((c) => (
            <article className="card" key={c.title}>
              <div className="card__head">
                <h3>{c.title}</h3>
              </div>
              <p className="card__body">{c.body}</p>
              <p className="card__ref">
                <span className="ref">{c.ref}</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="sechead">
          <p className="eyebrow">Approvals</p>
          <h2>
            Who has to <span className="grad">sign off</span>
          </h2>
          <p>
            Charter §5 classifies decisions by the minimum number of board members whose
            approval or signature is required.
          </p>
        </div>
        <div className="cards cards--pairs">
          {APPROVAL_MATRIX.map((tier) => (
            <article className="card" key={tier.ref}>
              <div className="card__head">
                <h3>{tier.tier}</h3>
                <span className="ref">{tier.ref}</span>
              </div>
              <ul className="ticks">
                {tier.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="notice">
          <strong>Banking control.</strong> {BANKING_CONTROL}
        </div>
        <div className="notice">
          <strong>Which document governs.</strong> {CHARTER_PRECEDENCE}
        </div>
      </section>

      <p className="section" style={{ textAlign: 'center' }}>
        <Link className="btn btn--primary" to="/contact">
          Get in touch
        </Link>
      </p>
    </>
  )
}
