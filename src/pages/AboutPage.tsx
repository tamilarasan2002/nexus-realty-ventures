import { CHARTER_STATUS, COMPANY, VALUES, VISION } from '../data/company'

export function AboutPage() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">About</p>
        <h1>
          Company identity, <span className="grad">vision and mission</span>
        </h1>
      </header>

      <section className="section">
        <h2 className="section__title">Identity</h2>
        <div className="table-scroll">
          <table className="data-table">
            <tbody>
              <tr>
                <th>Company name</th>
                <td>
                  {COMPANY.legalName}
                  <div className="cell-note">{COMPANY.legalNameTa}</div>
                </td>
              </tr>
              <tr>
                <th>Head office</th>
                <td>{COMPANY.headOffice}</td>
              </tr>
              <tr>
                <th>Sector</th>
                <td>{COMPANY.sector}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="notice notice--warn">
          <strong>Draft — not executed.</strong> {CHARTER_STATUS.notice} No incorporation number,
          CIN or GST number appears in either source document.
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">{VISION.headingEn}</h2>
        <div className="notice notice--warn">
          <strong>Draft.</strong> {VISION.caveat}
        </div>

        <h3 className="sub">Vision</h3>
        <p className="lede">{VISION.visionEn}</p>
        <p className="quote-ta">{VISION.visionTa}</p>

        <h3 className="sub">Mission</h3>
        <ul className="ticks">
          {VISION.missionEn.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="section__title">Values</h2>
        <p>Drawn from the charter’s own vision and mission wording.</p>
        <ul className="value-grid">
          {VALUES.map((v) => (
            <li key={v.en}>
              <span className="value-grid__en">{v.en}</span>
              <span className="value-grid__ta">{v.ta}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
