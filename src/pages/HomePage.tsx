import { Link } from 'react-router-dom'
import { COMPANY, LEADERSHIP, VALUES, VISION } from '../data/company'
import { BUILD_STAGES, COMMITMENTS, STATS, WHAT_WE_DO } from '../data/business'
import { BuildingScene } from '../components/art/BuildingScene'
import { StageIcon } from '../components/art/StageIcon'

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__body">
          <p className="eyebrow">{COMPANY.sector} · Namakkal, Tamil Nadu</p>
          <h1 className="hero__title">
            We buy land, build homes on it,
            <br />
            and <span className="grad">sell them</span>.
          </h1>
          <p className="hero__tagline">{COMPANY.tagline}</p>
          <p className="hero__lede">{WHAT_WE_DO.lede}</p>
          <div className="hero__actions">
            <Link className="btn btn--primary" to="/what-we-do">
              What we do
            </Link>
            <Link className="btn" to="/how-we-build">
              How we build →
            </Link>
          </div>

          <ul className="stats">
            {STATS.map((s) => (
              <li key={s.label}>
                <span className="stats__n">{s.n}</span>
                <span className="stats__label">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__art">
          <BuildingScene className="hero__scene" />
        </div>
      </section>

      <section className="section">
        <div className="sechead">
          <p className="eyebrow">The process</p>
          <h2>
            A project, <span className="grad">end to end</span>
          </h2>
          <p>Five stages, each with a named post answerable for it.</p>
        </div>
        <ol className="stagerow">
          {BUILD_STAGES.map((s) => (
            <li className="stagerow__item" key={s.key}>
              <span className="icon-tile">
                <StageIcon name={s.key} />
              </span>
              <span className="stagerow__n">Stage {s.n}</span>
              <span className="stagerow__title">{s.title}</span>
            </li>
          ))}
        </ol>
        <p style={{ textAlign: 'center' }}>
          <Link to="/how-we-build">See what happens at each stage →</Link>
        </p>
      </section>

      <section className="section">
        <div className="sechead">
          <p className="eyebrow">Controls</p>
          <h2>
            Why it <span className="grad">holds up</span>
          </h2>
          <p>
            These are controls written into the company’s governing documents, not assurances
            added for a website.
          </p>
        </div>
        <div className="cards cards--3">
          {COMMITMENTS.slice(0, 3).map((c) => (
            <article className="card" key={c.title}>
              <div className="card__head">
                <h3>{c.title}</h3>
              </div>
              <p className="card__body">{c.body}</p>
            </article>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: 18 }}>
          <Link to="/how-we-build">All six controls →</Link>
        </p>
      </section>

      <section className="section">
        <div className="sechead">
          <p className="eyebrow">Vision</p>
          <h2>
            What we are <span className="grad">aiming at</span>
          </h2>
          <p>{VISION.visionEn}</p>
        </div>
        <p className="quote-ta" style={{ margin: '0 auto' }}>
          {VISION.visionTa}
        </p>
        <ul className="value-grid" style={{ marginTop: 22 }}>
          {VALUES.map((v) => (
            <li key={v.en}>
              <span className="value-grid__en">{v.en}</span>
              <span className="value-grid__ta">{v.ta}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="sechead">
          <p className="eyebrow">Leadership</p>
          <h2>
            Who <span className="grad">runs it</span>
          </h2>
          <p>Five permanent posts, each with a defined remit.</p>
        </div>
        <div className="cards cards--3">
          {LEADERSHIP.map((r) => (
            <article className="card card--compact" key={r.post}>
              <div className="card__head">
                <h3>{r.post}</h3>
              </div>
              <p className="card__body">{r.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="ctaband">
          <h2>Looking at a home with us?</h2>
          <p>
            Start with how a project runs and who signs off on what, then get in touch. The head
            office is in Namakkal, Tamil Nadu.
          </p>
          <div className="ctaband__actions">
            <Link className="btn" to="/how-we-build">
              How we build
            </Link>
            <Link className="btn btn--ghost2" to="/contact">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
