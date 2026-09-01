import { JOINING_STEPS, RISKS } from '../data/joining'
import { POLICY_STATUS } from '../data/company'

export function HowItWorksPage() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">How it works</p>
        <h1>How membership and investment are structured</h1>
        <p>
          A plain description of what the Governance &amp; Investment Policy document sets out —
          how an honorary member is admitted, what they pay when, and how profit is returned.
          Section references point back to that document.
        </p>
      </header>

      <div className="notice notice--warn">
        <strong>Draft — not executed, and not an offer.</strong> {POLICY_STATUS.notice} This page
        describes the policy as drafted. It is not an offer, invitation or solicitation to invest.
      </div>

      <section className="section">
        <h2 className="section__title">The eight steps</h2>
        <ol className="steps">
          {JOINING_STEPS.map((s) => (
            <li className="step" key={s.n}>
              <span className="step__n">{s.n}</span>
              <div className="step__body">
                <h3 className="step__title">
                  {s.title} <span className="ref">{s.ref}</span>
                </h3>
                <p className="step__detail">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2 className="section__title">Risks you would be accepting</h2>
        <p>
          The policy requires every honorary member to acknowledge these in writing before joining
          (§8). They are reproduced here rather than buried.
        </p>
        <div className="cards cards--2">
          {RISKS.map((r) => (
            <article className="card" key={r.title}>
              <div className="card__head">
                <h3>⚠ {r.title}</h3>
              </div>
              <p className="card__body">{r.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="notice notice--legal">
          <strong>Legal caution, reproduced from the policy document.</strong>{' '}
          {POLICY_STATUS.legalCaution}
        </div>
      </section>
    </>
  )
}
