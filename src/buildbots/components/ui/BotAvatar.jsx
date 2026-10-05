// Flat geometric glyphs, one accent color for every bot. Distinct by shape.
const GLYPHS = {
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" opacity=".45" />
    </>
  ),
  stack: (
    <>
      <rect x="4" y="15" width="16" height="4" />
      <rect x="6" y="10" width="12" height="4" opacity=".7" />
      <rect x="8" y="5" width="8" height="4" opacity=".45" />
    </>
  ),
  ruler: (
    <>
      <rect x="3" y="9" width="18" height="6" />
      <rect x="7" y="9" width="1.5" height="3" fill="#001a43" />
      <rect x="11.25" y="9" width="1.5" height="4" fill="#001a43" />
      <rect x="15.5" y="9" width="1.5" height="3" fill="#001a43" />
    </>
  ),
  scale: (
    <>
      <rect x="11" y="4" width="2" height="16" />
      <rect x="4" y="7" width="16" height="2" />
      <path d="M4 14 L8 9 L12 14 Z" opacity=".6" />
      <path d="M12 14 L16 9 L20 14 Z" opacity=".6" />
    </>
  ),
  sum: <path d="M6 4 H18 V7 H10 L14.5 12 L10 17 H18 V20 H6 V17.5 L11 12 L6 6.5 Z" />,
  film: (
    <>
      <rect x="4" y="5" width="16" height="14" />
      <rect x="6" y="7" width="2" height="2" fill="#001a43" />
      <rect x="6" y="11" width="2" height="2" fill="#001a43" />
      <rect x="6" y="15" width="2" height="2" fill="#001a43" />
      <rect x="16" y="7" width="2" height="2" fill="#001a43" />
      <rect x="16" y="11" width="2" height="2" fill="#001a43" />
      <rect x="16" y="15" width="2" height="2" fill="#001a43" />
    </>
  ),
  question: (
    <>
      <path d="M8 9 a4 4 0 1 1 6 3.4 c-1.2.7-2 1.4-2 2.6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" />
      <rect x="10.7" y="17" width="2.6" height="2.6" />
    </>
  ),
  funnel: <path d="M3 4 H21 L14 12 V19 L10 21 V12 Z" />,
  burst: (
    <>
      <rect x="10.5" y="3" width="3" height="18" />
      <rect x="3" y="10.5" width="18" height="3" />
      <rect x="10.5" y="3" width="3" height="18" transform="rotate(45 12 12)" opacity=".55" />
      <rect x="3" y="10.5" width="18" height="3" transform="rotate(45 12 12)" opacity=".55" />
    </>
  ),
  shield: <path d="M12 3 L20 6 V12 C20 16.5 16.5 19.5 12 21 C7.5 19.5 4 16.5 4 12 V6 Z" />,
  send: (
    <>
      <path d="M3 11.5 L21 3 L13 21 L11 13.5 Z" />
      <path d="M11 13.5 L21 3" stroke="#001a43" strokeWidth="1.6" fill="none" />
    </>
  ),
  foreman: (
    <>
      <rect x="3" y="4" width="18" height="4" />
      <rect x="5" y="10" width="14" height="10" opacity=".7" />
      <rect x="10" y="13" width="4" height="7" fill="#001a43" />
    </>
  ),
  user: <circle cx="12" cy="12" r="8" />,
}

const SIZES = { xs: 'h-6 w-6', sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-12 w-12', xl: 'h-16 w-16' }

export default function BotAvatar({ glyph = 'grid', size = 'sm', className = '', muted = false }) {
  const g = GLYPHS[glyph] ?? GLYPHS.grid
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md ${muted ? 'bg-gray-20 text-gray-60' : 'bg-navy-900 text-white'} ${SIZES[size]} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" fill="currentColor">{g}</svg>
    </span>
  )
}
