/**
 * Site header with the primary navigation.
 *
 * Each nav entry is its own route rather than an in-page anchor: the app is
 * served from a static host and uses HashRouter, so "#section" anchors would
 * collide with the router's own hash.
 */
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { asset } from '../lib/asset'
import { ThemeToggle } from './ThemeToggle'

/**
 * Primary navigation. Everything is public except Documents, which routes
 * into /portal/* and is stopped by PortalGate's access-code prompt.
 */
const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/what-we-do', label: 'What we do' },
  { to: '/how-we-build', label: 'How we build' },
  { to: '/contact', label: 'Contact' },
  // Gated by PortalGate's access code.
  { to: '/portal/documents', label: 'Documents' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="brand" aria-label="Nexus Realty Ventures — home">
          {/*
            The wordmark is dark grey, so it disappears on a dark header. A
            second file recolours only the neutral pixels (the brand orange is
            untouched) and CSS picks the right one per theme.
          */}
          <img className="brand__logo brand__logo--light" src={asset('assets/logo.png')} alt="" />
          <img
            className="brand__logo brand__logo--dark"
            src={asset('assets/logo-dark.png')}
            alt=""
          />
        </NavLink>

        <ThemeToggle />

        <button
          className="site-header__toggle"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '✕' : '☰'}
        </button>

        <nav className={`site-nav${open ? ' site-nav--open' : ''}`}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
