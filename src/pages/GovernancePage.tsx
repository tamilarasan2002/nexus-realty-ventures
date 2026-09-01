import {
  MEMBERSHIP,
  POLICY_STATUS,
  PROFIT_RULE,
  VOTING,
} from '../data/company'

export function GovernancePage() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Governance &amp; Investment Policy</p>
        <h1>How decisions and returns are governed</h1>
        <p>
          Summarised from the company’s Governance &amp; Investment Policy document. Section
          references point back to that document, which remains the authority.
        </p>
      </header>

      {POLICY_STATUS.isDraft && (
        <div className="notice notice--warn">
          <strong>Draft — not executed.</strong> {POLICY_STATUS.notice}
        </div>
      )}

      <section className="section">
        <h2 className="section__title">Membership classes</h2>
        <div className="cards">
          {MEMBERSHIP.map((m) => (
            <article className="card" key={m.ref}>
              <div className="card__head">
                <h3>{m.title}</h3>
                <span className="ref">{m.ref}</span>
              </div>
              <ul className="ticks">
                {m.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Decision-making tiers</h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Who votes</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {VOTING.map((v) => (
                <tr key={v.ref}>
                  <td>
                    <strong>{v.tier}</strong> <span className="ref">{v.ref}</span>
                    <div className="cell-note">{v.note}</div>
                  </td>
                  <td>{v.electorate}</td>
                  <td>{v.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Profit and loss sharing</h2>
        <p className="lede">{PROFIT_RULE.headline}</p>
        <p className="formula">{PROFIT_RULE.formula}</p>
        <ul className="ticks">
          {PROFIT_RULE.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="section__title">Still to be settled</h2>
        <p>
          Annexure-A of the policy document is headed <em>“to be filled”</em>. These values are
          blank in the current version:
        </p>
        <ul className="ticks ticks--open">
          {POLICY_STATUS.unfilled.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
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
