import { Link } from 'react-router-dom'
import { COMPANY } from '../data/company'
import { asset } from '../lib/asset'

const COLUMNS = [
  {
    head: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    head: 'Our work',
    links: [
      { to: '/what-we-do', label: 'What we do' },
      { to: '/how-we-build', label: 'How we build' },
    ],
  },
  {
    head: 'Internal',
    links: [{ to: '/portal/documents', label: 'Documents' }],
  },
]

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__accent" />

      <div className="site-footer__inner">
        <div>
          {/* The dark-variant wordmark, since the footer is dark in both themes. */}
          <img className="site-footer__brandlogo" src={asset('assets/logo-dark.png')} alt="" />
          <p className="site-footer__line">{COMPANY.legalName}</p>
          <p className="site-footer__line">{COMPANY.tagline}</p>
          <p className="site-footer__line" style={{ marginTop: 10 }}>
            {COMPANY.headOffice}
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.head}>
            <p className="site-footer__colhead">{col.head}</p>
            <nav className="site-footer__links">
              {col.links.map((l) => (
                <Link key={l.to} to={l.to}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="site-footer__bar">
        <span>
          © {new Date().getFullYear()} {COMPANY.legalName}
        </span>
        <span className="site-footer__note">{COMPANY.sector}</span>
      </div>
    </footer>
  )
}
