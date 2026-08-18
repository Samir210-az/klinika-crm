export default function Logo({ size = 32, serpentColor = '#1f5f5b', cupColor = '#b8863b', className = '' }) {
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
      {/* Baza */}
      <ellipse cx="50" cy="87" rx="15" ry="3.5" fill={cupColor} opacity="0.9" />
      {/* Gövdə */}
      <rect x="47" y="52" width="6" height="34" rx="2" fill={cupColor} />
      {/* Kasa gövdəsi */}
      <path
        d="M28 33 C28 33 27 48 33 54 C38 59 45 60 50 60 C55 60 62 59 67 54 C73 48 72 33 72 33 Z"
        fill={cupColor}
      />
      {/* Kasa ağzı (üst elips - vurğu) */}
      <ellipse cx="50" cy="33" rx="22" ry="6.5" fill={cupColor} />
      <ellipse cx="50" cy="31.5" rx="22" ry="6" fill="white" opacity="0.18" />

      {/* İlan - gövdənin ətrafında dolanan */}
      <path
        d="M38 84 C30 80 30 72 38 68 C48 63 48 56 39 52 C29 48 30 40 40 37 C50 34 51 27 44 23"
        stroke={serpentColor}
        strokeWidth="4.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* İlan başı */}
      <path
        d="M44 23 C41 20 41 15 45 13 C49 11 54 13 54 17 C54 20 51 22 47 22 Z"
        fill={serpentColor}
      />
      <circle cx="49.5" cy="16.5" r="1.3" fill="white" />
    </svg>
  )
}
