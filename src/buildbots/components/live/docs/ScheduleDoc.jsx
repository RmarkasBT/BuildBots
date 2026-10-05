import { workingDays, fmtDay, fmtDow, fmtMonthDay, fmtShort } from '../../../lib/dates'

// Read-only schedule as a clean document: a working-day strip with one bar
// per item. Proposed moves render as a dashed ghost at the new position
// until applied; applied moves show solid with a "moved" tick.
function span(days, start, end) {
  const i = days.indexOf(start)
  const j = days.indexOf(end)
  if (i < 0 && j < 0) return null
  const from = i < 0 ? 0 : i
  const to = j < 0 ? days.length - 1 : j
  return { from, to }
}

export default function ScheduleDoc({ doc }) {
  const days = workingDays(doc.windowStart, doc.windowDays)
  const pending = doc.rows.some((r) => r.proposedStart)
  const cols = `220px repeat(${days.length}, minmax(0, 1fr))`

  return (
    <div className="p-4">
      <div className="rounded-md border border-gray-15 bg-white">
        <div className="flex items-start justify-between border-b border-gray-15 px-4 py-3">
          <div>
            <div className="text-[13px] font-semibold text-gray-90">{doc.title}</div>
            <div className="text-[11.5px] text-gray-50">
              {fmtMonthDay(days[0])} – {fmtMonthDay(days[days.length - 1])} · working days
            </div>
          </div>
          {pending && (
            <span className="rounded-sm bg-warning-bg px-2 py-0.5 text-[11px] font-medium text-warning-fg">{doc.pendingLabel}</span>
          )}
          {!pending && doc.applied && (
            <span className="rounded-sm bg-success-bg px-2 py-0.5 text-[11px] font-medium text-success-fg">{doc.appliedLabel}</span>
          )}
        </div>

        <div className="grid border-b border-gray-15 text-[10.5px] text-gray-50" style={{ gridTemplateColumns: cols }}>
          <div className="px-4 py-1.5 font-medium uppercase tracking-wide">Item</div>
          {days.map((d) => (
            <div key={d} className={`border-l border-gray-10 py-1.5 text-center ${d === '2026-10-02' ? 'bg-info-bg' : ''}`}>
              <div>{fmtDow(d)}</div>
              <div className="tabular-nums font-semibold text-gray-70">{fmtDay(d)}</div>
            </div>
          ))}
        </div>

        {doc.rows.map((r) => {
          const cur = span(days, r.start, r.end)
          const prop = r.proposedStart ? span(days, r.proposedStart, r.proposedEnd) : null
          return (
            <div key={r.id} className="grid items-center border-b border-gray-10 last:border-b-0" style={{ gridTemplateColumns: cols }}>
              <div className="px-4 py-2">
                <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-gray-90">
                  {r.conflict && <span title="Conflict" className="h-1.5 w-1.5 rounded-full bg-danger-fg" />}
                  {r.moved && <span title="Moved" className="text-[10px] font-semibold text-success-fg">↳</span>}
                  <span className="truncate">{r.title}</span>
                </div>
                <div className="truncate text-[11px] text-gray-50">{r.trade} · {fmtShort(r.start)}{r.end !== r.start ? ` – ${fmtShort(r.end)}` : ''}</div>
              </div>
              <div className="relative col-span-full col-start-2 h-10" style={{ gridColumn: `2 / span ${days.length}` }}>
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
                  {days.map((d) => <div key={d} className="border-l border-gray-10" />)}
                </div>
                {cur && (
                  <div
                    className={`absolute top-2 h-6 rounded-sm ${r.conflict ? 'bg-danger-bg ring-1 ring-danger-fg/40' : r.moved ? 'bg-success-bg ring-1 ring-success-fg/40' : 'bg-navy-900/85'} ${prop ? 'opacity-60' : ''}`}
                    style={{ left: `calc(${(cur.from / days.length) * 100}% + 3px)`, width: `calc(${((cur.to - cur.from + 1) / days.length) * 100}% - 6px)` }}
                  />
                )}
                {prop && (
                  <div
                    className="absolute top-2 h-6 rounded-sm border border-dashed border-brand-blue bg-info-bg/70"
                    style={{ left: `calc(${(prop.from / days.length) * 100}% + 3px)`, width: `calc(${((prop.to - prop.from + 1) / days.length) * 100}% - 6px)` }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex items-center gap-4 px-1 text-[11px] text-gray-50">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-navy-900/85" /> Scheduled</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-danger-bg ring-1 ring-danger-fg/40" /> Conflict</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm border border-dashed border-brand-blue bg-info-bg/70" /> Proposed</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-success-bg ring-1 ring-success-fg/40" /> Moved</span>
      </div>
    </div>
  )
}
