import { FAQ } from '../data/joining'

export function FaqPage() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Questions</p>
        <h1>Common questions</h1>
        <p>
          Every answer below comes from the company charter or the governance policy — nothing is
          added from outside them. Where a document leaves a value blank, that is said plainly.
        </p>
      </header>

      <section className="section">
        <div className="faq">
          {FAQ.map((item) => (
            <details className="faq__item" key={item.q}>
              <summary className="faq__q">{item.q}</summary>
              <div className="faq__a">
                <p>{item.a}</p>
                <p className="faq__ref">
                  <span className="ref">{item.ref}</span>
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
