import { copy } from '../../data'

// Native actions get a filled Buildertrend badge. Browser actions get an
// outlined badge with a cursor icon. Tell them apart from across a room.
export function IconCursor({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
      <path d="M5 3l14 8-6 1.5L10 19z" />
    </svg>
  )
}

// source: 'buildertrend' (filled) | 'browser' (outlined, cursor) |
// 'connector' (outlined, names the connector, e.g. Gmail).
export default function SourceBadge({ source = 'buildertrend', connector, className = '' }) {
  if (source === 'connector') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-sm border border-gray-40 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-gray-70 ${className}`}>
        <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 7V3M15 7V3M6 7h12v4a6 6 0 0 1-12 0zM12 17v4" />
        </svg>
        {connector ?? copy.badges.connector}
      </span>
    )
  }
  if (source === 'browser') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-sm border border-gray-40 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-gray-70 ${className}`}>
        <IconCursor className="h-2.5 w-2.5" />
        {copy.badges.browser}
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center rounded-sm bg-navy-900 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-white ${className}`}>
      {copy.badges.native}
    </span>
  )
}
