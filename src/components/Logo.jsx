import { useId } from 'react'

const SERPENT_PATH =
  'M39 84.5 C29.5 80 29 71 37.5 66.5 C46 62 47.5 55.5 39.5 51.5 C30 46.8 30.5 39 40 35.5 C48.5 32.3 50.5 26.5 44.5 22.5'

export default function Logo({ size = 32, serpentColor = '#1f5f5b', cupColor = '#b8863b', className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (name) => `${name}-${uid}`
  const ref = (name) => `url(#${id(name)})`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`logo-3d ${className}`.trim()}
      aria-label="Klinika CRM loqosu"
    >
      <defs>
        <linearGradient id={id('metal')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.42" />
        </linearGradient>
        <linearGradient id={id('cyl')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.42" />
          <stop offset="0.32" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id={id('bowl')} cx="0.34" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#fff" stopOpacity="0.62" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id={id('head')} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.38" />
        </radialGradient>
        <linearGradient id={id('cavity')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.62" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <radialGradient id={id('glow')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4d2" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff4d2" stopOpacity="0" />
        </radialGradient>
        <filter id={id('soft')} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <filter id={id('ground')} x="-30%" y="-100%" width="160%" height="300%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        <filter id={id('lift')} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="1.6" stdDeviation="1.3" floodColor="#000" floodOpacity="0.32" />
        </filter>
      </defs>

      <ellipse cx="50" cy="91" rx="21" ry="3.4" fill="#000" opacity="0.3" filter={ref('ground')} />

      <g filter={ref('lift')}>
        {/* Postament */}
        <path d="M34 85.2 V87.6 A16 4.2 0 0 0 66 87.6 V85.2 Z" fill={cupColor} />
        <path d="M34 85.2 V87.6 A16 4.2 0 0 0 66 87.6 V85.2 Z" fill={ref('cyl')} />
        <ellipse cx="50" cy="85.2" rx="16" ry="4.2" fill={cupColor} />
        <ellipse cx="50" cy="85.2" rx="16" ry="4.2" fill={ref('metal')} />
        <ellipse cx="46" cy="84.2" rx="7" ry="1.4" fill="#fff" opacity="0.3" />

        {/* Gövdə və düyün */}
        <path d="M46.6 54 L53.4 54 L52.2 85 L47.8 85 Z" fill={cupColor} />
        <path d="M46.6 54 L53.4 54 L52.2 85 L47.8 85 Z" fill={ref('cyl')} />
        <ellipse cx="50" cy="72" rx="4.6" ry="2.6" fill={cupColor} />
        <ellipse cx="50" cy="72" rx="4.6" ry="2.6" fill={ref('cyl')} />
        <ellipse cx="48.6" cy="71.2" rx="1.6" ry="0.7" fill="#fff" opacity="0.5" />

        {/* Kasa */}
        <path
          d="M27.5 32.5 C27 38 27.5 44 31 49 C35.5 56 43 60.5 50 60.5 C57 60.5 64.5 56 69 49 C72.5 44 73 38 72.5 32.5 Z"
          fill={cupColor}
        />
        <path
          d="M27.5 32.5 C27 38 27.5 44 31 49 C35.5 56 43 60.5 50 60.5 C57 60.5 64.5 56 69 49 C72.5 44 73 38 72.5 32.5 Z"
          fill={ref('bowl')}
        />
        <ellipse cx="37.5" cy="44" rx="2.6" ry="7" transform="rotate(-24 37.5 44)" fill="#fff" opacity="0.3" filter={ref('soft')} />

        <ellipse cx="50" cy="32.5" rx="22.5" ry="6.8" fill={cupColor} />
        <ellipse cx="50" cy="32.5" rx="22.5" ry="6.8" fill={ref('metal')} />
        <ellipse cx="50" cy="33.2" rx="19.4" ry="5.2" fill={ref('cavity')} />
        <ellipse className="logo-glow" cx="50" cy="34.6" rx="13" ry="3.3" fill={ref('glow')} />
        <path d="M28.6 31 C34 26.6 66 26.6 71.4 31" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />

        {/* İlan: kölgə, kontur, gövdə, işıq */}
        <path d={SERPENT_PATH} transform="translate(1.1 1.4)" stroke="#000" strokeOpacity="0.3" strokeWidth="5.8" strokeLinecap="round" />
        <path d={SERPENT_PATH} stroke="#000" strokeOpacity="0.22" strokeWidth="6.3" strokeLinecap="round" />
        <path d={SERPENT_PATH} stroke={serpentColor} strokeWidth="5.2" strokeLinecap="round" />
        <path d={SERPENT_PATH} transform="translate(1.1 1.2)" stroke="#000" strokeOpacity="0.2" strokeWidth="2.6" strokeLinecap="round" />
        <path d={SERPENT_PATH} transform="translate(-0.9 -0.9)" stroke="#fff" strokeOpacity="0.14" strokeWidth="3" strokeLinecap="round" />
        <path d={SERPENT_PATH} transform="translate(-1 -1)" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.3" strokeLinecap="round" />

        {/* Baş */}
        <path
          className="logo-tongue"
          d="M54.2 17.2 L58.6 16.4 M58.6 16.4 L60.4 14.9 M58.6 16.4 L60.4 18"
          stroke="#e0584d"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M44.5 22.5 C41 19.5 40.5 14.5 44.5 12 C48.7 9.5 54 11.5 54.3 16 C54.5 19.5 51 21.8 46.7 21.5 Z"
          fill={serpentColor}
          stroke="#000"
          strokeOpacity="0.2"
          strokeWidth="0.8"
        />
        <path
          d="M44.5 22.5 C41 19.5 40.5 14.5 44.5 12 C48.7 9.5 54 11.5 54.3 16 C54.5 19.5 51 21.8 46.7 21.5 Z"
          fill={ref('head')}
        />
        <circle cx="49.6" cy="15.6" r="2" fill="#fff" />
        <circle cx="50" cy="15.8" r="1.1" fill="#0d1f1b" />
        <circle cx="49.6" cy="15.2" r="0.4" fill="#fff" />
      </g>
    </svg>
  )
}
