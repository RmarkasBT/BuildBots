import { partnerById, TODAY } from '../../../data'
import { useDispatch, useRunner } from '../../../store/useBuildbots'
import { A } from '../../../store/actions'
import { parseISO, fmtShort } from '../../../lib/dates'
import { BotBlock } from '../Message'

// The trades flagged for one trade type, sorted by most recent job with the
// company. Checkboxes pick who gets the bid; the primary button carries the
// count. A decided card locks and remembers the choice.

function daysAgo(iso) {
  if (!iso) return null
  return Math.round((parseISO(TODAY) - parseISO(iso)) / 86400000)
}

function lastUsedLabel(iso) {
  const d = daysAgo(iso)
  if (d == null) return 'Never'
  if (d < 1) return 'Today'
  if (d < 14) return `${d} days ago`
  if (d < 60) return `${Math.round(d / 7)} weeks ago`
  if (d < 365) return `${Math.round(d / 30)} months ago`
  return `${Math.round(d / 30)} months ago`
}

function coiState(iso) {
  const d = -daysAgo(iso)
  if (d < 0) return { label: 'COI lapsed', tone: 'danger' }
  if (d < 45) return { label: `COI expires ${fmtShort(iso)}`, tone: 'warning' }
  return { label: `COI to ${fmtShort(iso)}`, tone: 'ok' }
}

const TONE = {
  danger: 'bg-danger-bg text-danger-fg',
  warning: 'bg-warning-bg text-warning-fg',
  ok: 'text-gray-50',
}

export default function TradesCard({ message }) {
  const dispatch = useDispatch()
  const runner = useRunner()
  const c = message.content ?? {}
  const decided = message.decided
  const selected = c.selected ?? []

  const rows = (c.partnerIds ?? [])
    .map((id) => partnerById[id])
    .filter(Boolean)
    .sort((a, b) => (b.lastUsed ?? '').localeCompare(a.lastUsed ?? ''))

  const toggle = (id) => {
    if (decided) return
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    dispatch({ type: A.PATCH_MESSAGE, payload: { id: message.id, patch: { content: { ...c, selected: next } } } })
  }

  const pick = (o) => {
    dispatch({ type: A.PATCH_MESSAGE, payload: { id: message.id, patch: { decided: o.goto } } })
    runner.resumeFromUser(message.convId, o.send ?? o.label, { goto: o.goto })
  }

  return (
    <BotBlock botId={message.author}>
      <div className={`w-[560px] rounded-md border bg-white ${decided ? 'border-gray-15' : 'border-navy-900/30'}`}>
        <div className="flex items-center gap-2 border-b border-gray-10 px-3 py-2">
          <span className="rounded-sm bg-navy-900 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-white">Buildertrend</span>
          <span className="text-[12.5px] font-semibold text-gray-90">{c.title}</span>
          {c.subtitle && <span className="text-[11px] text-gray-50">· {c.subtitle}</span>}
          <span className="ml-auto text-[11px] tabular-nums text-gray-50">{selected.length} of {rows.length} selected</span>
        </div>

        <ul className="divide-y divide-gray-10">
          {rows.map((p, i) => {
            const on = selected.includes(p.id)
            const coi = coiState(p.coiExpires)
            const flag = c.flags?.[p.id]
            return (
              <li key={p.id} className={`flex items-start gap-3 px-3 py-2 ${decided && !on ? 'opacity-50' : ''}`}>
                <button
                  onClick={() => toggle(p.id)}
                  disabled={!!decided}
                  aria-label={`${on ? 'Remove' : 'Add'} ${p.name}`}
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${on ? 'border-navy-900 bg-navy-900 text-white' : 'border-gray-30 bg-white'}`}
                >
                  {on && (
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                  )}
                </button>
                <span className="w-4 shrink-0 pt-px text-[11px] tabular-nums text-gray-40">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="truncate text-[12.5px] font-semibold text-gray-90">{p.name}</span>
                    <span className="truncate text-[11.5px] text-gray-60">{p.contact}</span>
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-gray-50">
                    <span>{p.jobs ?? 0} {p.jobs === 1 ? 'job' : 'jobs'} with Northaven</span>
                    {p.lastJob && <span>· last on {p.lastJob}{p.lastScope ? `, ${p.lastScope.toLowerCase()}` : ''}</span>}
                  </span>
                  {(p.rating || flag) && (
                    <span className="mt-1 flex flex-wrap items-center gap-1">
                      {p.rating && <span className="rounded-sm border border-gray-20 px-1.5 py-0.5 text-[10.5px] text-gray-60">{p.rating}</span>}
                      {flag && <span className="rounded-sm bg-danger-bg px-1.5 py-0.5 text-[10.5px] font-medium text-danger-fg">{flag}</span>}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-right">
                  <span className={`block text-[12px] font-medium tabular-nums ${i === 0 ? 'text-gray-90' : 'text-gray-70'}`}>{lastUsedLabel(p.lastUsed)}</span>
                  <span className={`mt-0.5 inline-block rounded-sm px-1 text-[10.5px] ${TONE[coi.tone]}`}>{coi.label}</span>
                </span>
              </li>
            )
          })}
        </ul>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-10 px-3 py-2">
          {(c.options ?? []).map((o, i) => {
            const chosen = decided === o.goto
            if (decided && !chosen) return null
            const label = i === 0 && !decided ? `${o.label} (${selected.length})` : o.label
            return (
              <button
                key={o.goto ?? o.label}
                disabled={!!decided || (i === 0 && selected.length === 0)}
                onClick={() => pick(o)}
                className={`h-7 rounded-sm px-3 text-[12px] font-semibold disabled:opacity-60 ${i === 0 && !decided ? 'bg-navy-900 text-white' : chosen ? 'bg-success-bg text-success-fg' : 'border border-gray-20 text-gray-80 hover:bg-gray-5'}`}
              >
                {chosen ? `✓ ${label}` : label}
              </button>
            )
          })}
          {!decided && <span className="ml-auto text-[11px] text-gray-50">Uncheck anyone who should not get it.</span>}
        </div>
      </div>
    </BotBlock>
  )
}
