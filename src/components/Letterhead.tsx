/**
 * Company letterhead, reproducing the printed cover sheet: an orange corner
 * band with a black wedge inset inside it, the contact block on the left, the
 * logo and social row on the right, and a rule closing the band.
 *
 * It appears on the first sheet of every generated document; continuation
 * sheets carry the compact running head instead.
 *
 * Colours are literal rather than themed — this sits inside the printed page,
 * which is white whatever the app's theme is.
 */
import { COMPANY } from '../data/company'
import { asset } from '../lib/asset'

/** Small monochrome marks for the social row, drawn rather than fetched. */
const SOCIALS = [
  {
    name: 'WhatsApp',
    fill: '#17181a',
    path: 'M12 3.5a8.4 8.4 0 0 0-7.2 12.7L3.6 20.5l4.4-1.1A8.4 8.4 0 1 0 12 3.5Zm4.8 11.8c-.2.6-1.2 1.1-1.7 1.1-.4 0-.9.2-3-.7a10.7 10.7 0 0 1-4.3-3.9c-.3-.4-.9-1.4-.9-2.6 0-1.3.7-1.9 1-2.1a1 1 0 0 1 .7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c0 .2 0 .3-.1.5l-.4.5c-.1.1-.3.3-.1.6.5.8 1 1.4 1.7 1.9.7.4 1 .5 1.2.4l.7-.8c.2-.2.3-.2.6 0l1.7.9c.2.1.3.2.3.3a2 2 0 0 1-.1.9Z',
  },
  {
    name: 'Email',
    fill: '#17181a',
    path: 'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm.9 2 7.1 4.6L19.1 8H4.9Z',
  },
  {
    name: 'Instagram',
    fill: '#17181a',
    path: 'M8 3.5h8A4.5 4.5 0 0 1 20.5 8v8a4.5 4.5 0 0 1-4.5 4.5H8A4.5 4.5 0 0 1 3.5 16V8A4.5 4.5 0 0 1 8 3.5Zm0 2A2.5 2.5 0 0 0 5.5 8v8A2.5 2.5 0 0 0 8 18.5h8a2.5 2.5 0 0 0 2.5-2.5V8A2.5 2.5 0 0 0 16 5.5H8ZM12 7.6a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Zm0 2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Zm4.8-2.9a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z',
  },
  {
    name: 'Facebook',
    fill: '#1877f2',
    path: 'M12 2a10 10 0 0 0-1.6 19.9v-7h-2.5V12h2.5v-1.9c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 12 2Z',
  },
  {
    name: 'YouTube',
    fill: '#17181a',
    path: 'M21.6 7.6a2.5 2.5 0 0 0-1.8-1.8C18.2 5.4 12 5.4 12 5.4s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.6 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.4 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.4ZM10.2 14.8V9.2L15 12l-4.8 2.8Z',
  },
]

export function Letterhead() {
  return (
    <div className="lh">
      {/* Orange corner with the black wedge inset inside it, leaving an even
          orange band along the top and left, as on the printed sheet. */}
      <div className="lh__corner" aria-hidden="true" />
      <div className="lh__wedge" aria-hidden="true" />

      <div className="lh__row">
        <div className="lh__info">
          <p className="lh__name">{COMPANY.legalName.toUpperCase()}.</p>
          <p className="lh__line">HO : Namakkal.</p>
          <p className="lh__line">
            <SocialMark d={SOCIALS[0].path} fill="#17181a" />
            {COMPANY.phone}
          </p>
          <p className="lh__line">
            <SocialMark d={SOCIALS[1].path} fill="#17181a" />
            {COMPANY.email}
          </p>
          <p className="lh__line">
            <SocialMark
              d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c1.3 0 2.6 1.9 3.1 4.6H8.9C9.4 5.9 10.7 4 12 4ZM4.3 11h3.2c.1-1.5.3-2.9.7-4.1A8 8 0 0 0 4.3 11Zm0 2a8 8 0 0 0 3.9 4.1c-.4-1.2-.6-2.6-.7-4.1H4.3Zm5.2 0h5c-.1 1.3-.3 2.5-.6 3.5-.5 1.6-1.2 2.5-1.9 2.5s-1.4-.9-1.9-2.5c-.3-1-.5-2.2-.6-3.5Zm0-2c.1-1.3.3-2.5.6-3.5h3.8c.3 1 .5 2.2.6 3.5h-5Zm6.5 0c-.1-1.5-.3-2.9-.7-4.1a8 8 0 0 1 3.9 4.1h-3.2Zm3.2 2a8 8 0 0 1-3.9 4.1c.4-1.2.6-2.6.7-4.1h3.2Z"
              fill="#17181a"
            />
            {COMPANY.website}
          </p>
        </div>

        <div className="lh__brand">
          <img className="lh__logo" src={asset('assets/logo.png')} alt="Nexus Realty Ventures" />
          <div className="lh__socials" aria-hidden="true">
            {SOCIALS.map((s) => (
              <svg key={s.name} viewBox="0 0 24 24" className="lh__social">
                <path d={s.path} fill={s.fill} />
              </svg>
            ))}
          </div>
        </div>
      </div>

      <div className="lh__rule" aria-hidden="true" />
    </div>
  )
}

function SocialMark({ d, fill }: { d: string; fill: string }) {
  return (
    <svg viewBox="0 0 24 24" className="lh__ico">
      <path d={d} fill={fill} />
    </svg>
  )
}
