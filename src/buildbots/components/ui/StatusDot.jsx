import { copy } from '../../data'

// Four statuses. Three status colors, used only for status.
const STYLE = {
  idle: 'bg-gray-30',
  working: 'bg-brand-blue bb-pulse',
  waiting: 'bg-warning-fg',
  scheduled: 'bg-success-fg',
}

export default function StatusDot({ status = 'idle', working = false, className = '' }) {
  const s = working ? 'working' : status
  return (
    <span
      title={copy.status[s]}
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${STYLE[s] ?? STYLE.idle} ${className}`}
    />
  )
}
