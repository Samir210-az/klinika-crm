import { useId } from 'react'

export default function Logo({ size = 32, serpentColor = '#1f5f5b', cupColor = '#b8863b', className = '' }) {
  const uid = useId()
  const cupGradId = `cupGrad-${uid}`
  const serpentGradId = `serpentGrad-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Klinika CRM loqosu"
    >
      <defs>
        <linearGradient id={cupGradId} x1="30" y1="20" x2="70" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={cupColor} stopOpacity="1" />
          <stop offset="55%" stopColor={cupColor} stopOpacity="0.92" />
          <stop offset="100%" stopColor={cupColor} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={serpentGradId} x1="25" y1="15" x2="55" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={serpentColor} stopOpacity="1" />
          <stop offset="100%" stopColor={serpentColor} stopOpacity="0.78" />
        </linearGradient>
      </defs>

      {/* Baza */}
      <ellipse cx="50" cy="87.5" rx="15.5" ry="3.5" fill={`url(#${cupGradId})`} />
      {/* Gövdə (stem) - incə daralma effekti */}
      <path d="M47.3 52 L52.7 52 L51.5 86 L48.5 86 Z" fill={`url(#${cupGradId})`} />

      {/* Kasa gövdəsi */}
      <path
        d="M27.5 32.5 C27 38 27.5 44 31 49 C35.5 56 43 60.5 50 60.5 C57 60.5 64.5 56 69 49 C72.5 44 73 38 72.5 32.5 Z"
        fill={`url(#${cupGradId})`}
      />
      {/* Kasa ağzı (üst elips) */}
      <ellipse cx="50" cy="32.5" rx="22.5" ry="6.8" fill={`url(#${cupGradId})`} />
      {/* Vurğu (işıq əksi) */}
      <ellipse cx="44" cy="30.5" rx="10" ry="3" fill="white" opacity="0.28" />
      {/* Kasa ağzının içi (kölgə) */}
      <ellipse cx="50" cy="33.3" rx="17.5" ry="4.6" fill="black" opacity="0.12" />

      {/* İlan - gövdənin ətrafında dolanan, incə + qalınlaşan */}
      <path
        d="M39 84.5 C29.5 80 29 71 37.5 66.5 C46 62 47.5 55.5 39.5 51.5 C30 46.8 30.5 39 40 35.5 C48.5 32.3 50.5 26.5 44.5 22.5"
        stroke={`url(#${serpentGradId})`}
        strokeWidth="4.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* İncə işıq zolağı ilanın üzərində */}
      <path
        d="M39 84.5 C29.5 80 29 71 37.5 66.5 C46 62 47.5 55.5 39.5 51.5 C30 46.8 30.5 39 40 35.5 C48.5 32.3 50.5 26.5 44.5 22.5"
        stroke="white"
        strokeOpacity="0.18"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* İlan başı */}
      <path
        d="M44.5 22.5 C41 19.5 40.5 14.5 44.5 12 C48.7 9.5 54 11.5 54.3 16 C54.5 19.5 51 21.8 46.7 21.5 Z"
        fill={`url(#${serpentGradId})`}
      />
      <circle cx="49.8" cy="15.8" r="1.3" fill="white" opacity="0.85" />
    </svg>
  )
}
