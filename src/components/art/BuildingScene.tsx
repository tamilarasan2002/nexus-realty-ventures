/**
 * Residential-development scene used as the hero artwork.
 *
 * Drawn as inline SVG so it inherits the theme tokens (no second asset for
 * dark mode, no licensing question, and it stays sharp at any size). The
 * palette deliberately echoes the company logo: an orange pitched roof
 * against grey massing.
 */
export function BuildingScene({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 480 300"
      role="img"
      aria-label="Illustration of a residential development"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* sky wash */}
      <defs>
        <linearGradient id="bs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bs-mass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--art-mass)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--art-mass)" stopOpacity="0.7" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="480" height="248" fill="url(#bs-sky)" />
      <circle cx="404" cy="58" r="26" fill="var(--brand)" opacity="0.22" />

      {/* crane — signals work in progress */}
      <g stroke="var(--art-mass)" strokeWidth="3" fill="none" opacity="0.6">
        <path d="M96 248V54" />
        <path d="M52 62h132" />
        <path d="M96 54 62 62M96 54l72 8" strokeWidth="2" />
        <path d="M150 62v30" strokeWidth="2" />
      </g>
      <rect x="141" y="92" width="18" height="13" rx="2" fill="var(--brand)" opacity="0.75" />

      {/* left apartment block */}
      <rect x="24" y="132" width="104" height="116" rx="3" fill="url(#bs-mass)" />
      <g fill="var(--art-window)" opacity="0.92">
        {[146, 174, 202].map((y) =>
          [36, 60, 84, 104].map((x) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="16" height="18" rx="2" />
          )),
        )}
      </g>

      {/* centre house with the signature orange roof */}
      <path d="M168 158 240 108l72 50z" fill="var(--brand)" />
      <path d="M240 108l72 50h-14l-58-40z" fill="var(--brand)" opacity="0.75" />
      <rect x="184" y="158" width="112" height="90" rx="3" fill="var(--art-wall)" stroke="var(--art-outline)" strokeWidth="2" />
      <rect x="228" y="196" width="24" height="52" rx="2" fill="var(--brand)" opacity="0.28" />
      <rect x="228" y="196" width="24" height="52" rx="2" fill="none" stroke="var(--brand)" strokeWidth="2" />
      <g fill="var(--art-window)" stroke="var(--art-outline)" strokeWidth="2" opacity="0.95">
        <rect x="196" y="176" width="24" height="24" rx="2" />
        <rect x="260" y="176" width="24" height="24" rx="2" />
        <path d="M208 176v24M196 188h24M272 176v24M260 188h24" strokeWidth="1.5" fill="none" />
      </g>
      {/* chimney, as in the logo */}
      <rect x="272" y="112" width="12" height="26" rx="2" fill="var(--brand)" opacity="0.85" />

      {/* right tower */}
      <rect x="330" y="112" width="86" height="136" rx="3" fill="url(#bs-mass)" />
      <g fill="var(--art-window)" opacity="0.92">
        {[126, 152, 178, 204].map((y) =>
          [342, 364, 386].map((x) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="15" height="17" rx="2" />
          )),
        )}
      </g>
      <rect x="330" y="106" width="86" height="8" rx="2" fill="var(--brand)" opacity="0.8" />

      {/* saplings */}
      <g stroke="var(--ok)" strokeWidth="2.5" opacity="0.6">
        <path d="M436 248v-22" />
        <path d="M436 232l8-8M436 236l-8-8" strokeWidth="2" />
        <path d="M14 248v-18" />
        <path d="M14 236l7-7M14 240l-7-7" strokeWidth="2" />
      </g>

      {/* ground */}
      <path d="M0 248h480" stroke="var(--art-outline)" strokeWidth="3" />
      <path d="M0 262h140M170 262h120M320 262h160" stroke="var(--art-outline)" strokeWidth="6" strokeLinecap="round" opacity="0.45" />
    </svg>
  )
}
