import { currentUser } from '../../../data'

// A file the user dropped into the thread. Right-aligned like a user
// message, with a document tile instead of text.
export default function UserFileCard({ message }) {
  const c = message.content ?? {}
  const meta = [c.kind, c.size, c.pages ? `${c.pages} sheets` : null].filter(Boolean).join(' · ')
  return (
    <div className="bb-msg-in flex justify-end">
      <div className="max-w-[560px] rounded-md bg-info-bg px-3 py-2">
        <div className="mb-1.5 text-[11px] font-semibold text-info-fg">{currentUser.name}</div>
        <div className="flex items-center gap-3 rounded-md border border-gray-15 bg-white p-2 pr-3">
          <span className="relative flex h-11 w-9 shrink-0 items-center justify-center rounded-[3px] border border-gray-20 bg-gray-5">
            <svg viewBox="0 0 40 48" className="h-full w-full" fill="none">
              {[12, 18, 24, 30].map((y) => <rect key={y} x="8" y={y} width={y === 30 ? 14 : 24} height="2" fill="#d3dbe2" />)}
            </svg>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-[2px] bg-danger-fg px-1 text-[8.5px] font-bold leading-[13px] text-white">PDF</span>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12.5px] font-semibold text-gray-90">{c.name}</span>
            <span className="block text-[11px] text-gray-50">{meta}</span>
          </span>
          <span className="ml-2 flex shrink-0 items-center gap-1 text-[11px] font-medium text-success-fg"><span>✓</span>Uploaded</span>
        </div>
      </div>
    </div>
  )
}
