import { Link } from 'react-router-dom'
import { PROJECT_PHOTOS, WHAT_WE_DO } from '../data/business'
import { COMPANY } from '../data/company'
import { BuildingScene } from '../components/art/BuildingScene'
import { asset } from '../lib/asset'

export function WhatWeDoPage() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">What we do</p>
        <h1>
          We buy land, build homes on it, and <span className="grad">sell them</span>.
        </h1>
        <p className="lede">{WHAT_WE_DO.lede}</p>
      </header>

      <section className="section">
        <div className="art-band">
          <BuildingScene className="art-band__svg" />
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">The three parts of a project</h2>
        <div className="cards cards--3">
          {WHAT_WE_DO.pillars.map((p) => (
            <article className="card" key={p.title}>
              <div className="card__head">
                <h3>{p.title}</h3>
              </div>
              <p className="card__body">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Where we work</h2>
        <div className="cards cards--pairs">
          <article className="card">
            <div className="card__head">
              <h3>Namakkal, Tamil Nadu</h3>
            </div>
            <p className="card__body">
              {COMPANY.headOffice}. The company’s stated ambition is to become the developer people
              in Tamil Nadu turn to first for residential real estate.
            </p>
          </article>
          <article className="card">
            <div className="card__head">
              <h3>Residential only</h3>
            </div>
            <p className="card__body">
              The mission is specific to residential projects — homes built to deliver fair value to
              buyers, not commercial or speculative development.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Our sites</h2>
        {PROJECT_PHOTOS.length > 0 ? (
          <div className="gallery">
            {PROJECT_PHOTOS.map((p) => (
              <figure className="gallery__item" key={p.src}>
                <img src={asset(p.src)} alt={p.alt} loading="lazy" />
                <figcaption>{p.caption}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <>
            <div className="gallery">
              {[0, 1, 2].map((i) => (
                <div className="gallery__slot" key={i}>
                  <BuildingScene className="gallery__svg" />
                  <span className="gallery__badge">Photo slot {i + 1}</span>
                </div>
              ))}
            </div>
            <div className="notice">
              No site photographs are bundled yet. Add real pictures of the company’s own land and
              completed work to <code>public/images/</code> and list them in{' '}
              <code>src/data/projects.ts</code> — they will replace these drawings. Stock photos of
              other people’s buildings are deliberately not used here.
            </div>
          </>
        )}
      </section>

      <p className="section">
        <Link className="btn btn--primary" to="/how-we-build">
          How we build →
        </Link>{' '}
        <Link className="btn" to="/contact">
          Get in touch
        </Link>
      </p>
    </>
  )
}
