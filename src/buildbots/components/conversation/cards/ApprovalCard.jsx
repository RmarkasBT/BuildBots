import { useState } from 'react'
import { company, copy } from '../../../data'
import { useStore, useDispatch, useRunner } from '../../../store/useBuildbots'
import { selectApprovals, selectDoc } from '../../../store/selectors'
import { A } from '../../../store/actions'
import { fmtShort, addDays } from '../../../lib/dates'
import SourceBadge from '../../ui/SourceBadge'
import { BotBlock } from '../Message'

// Moves for a schedule approval come straight from the doc's proposed dates,
// so the card, the live pane and the approval queue never disagree.
function useScheduleMoves(docId) {
  const doc = useStore(selectDoc(docId))
  if (!doc) return []
  return doc.rows.filter((r) => r.proposedStart || r.moved).map((r) => ({
    id: r.id, title: r.title, trade: r.trade,
    from: r.moved ? null : r.start, to: r.proposedStart ?? r.start,
  }))
}

export function ApprovalBody({ approval, editing, edits, setEdits }) {
  const moves = useScheduleMoves(approval.preview?.docId)
  if (approval.kind === 'schedule') {
    return (
      <ul className="divide-y divide-gray-10">
        {moves.map((m) => {
          const to = edits?.[m.id] ?? m.to
          return (
            <li key={m.id} className="flex items-center gap-3 px-3 py-1.5 text-[12.5px]">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-gray-90">{m.title}</span>
                <span className="block truncate text-[11px] text-gray-50">{m.trade}</span>
              </span>
              {m.from && <span className="tabular-nums text-gray-40 line-through">{fmtShort(m.from)}</span>}
              <span className="text-gray-40">→</span>
              {editing ? (
                <span className="flex items-center gap-1">
                  <button onClick={() => setEdits({ ...edits, [m.id]: addDays(to, -1) })} className="h-6 w-6 rounded-sm border border-gray-20 text-gray-70 hover:bg-gray-5">−</button>
                  <span className="w-[76px] text-center tabular-nums font-medium text-gray-90">{fmtShort(to)}</span>
                  <button onClick={() => setEdits({ ...edits, [m.id]: addDays(to, 1) })} className="h-6 w-6 rounded-sm border border-gray-20 text-gray-70 hover:bg-gray-5">+</button>
                </span>
              ) : (
                <span className="tabular-nums font-medium text-gray-90">{fmtShort(to)}</span>
              )}
            </li>
          )
        })}
      </ul>
    )
  }
  const d = approval.draft
  if (!d) return <div className="px-3 py-2 text-[12.5px] text-gray-70">{approval.summary}</div>
  return (
    <div className="px-3 py-2 text-[12.5px]">
      <div className="text-[11px] text-gray-50">
        {d.channel === 'sms' ? 'Text' : 'Email'} to <span className="font-medium text-gray-80">{d.to}</span>
        {d.toPhone ? ` · ${d.toPhone}` : d.toEmail ? ` · ${d.toEmail}` : ''}
      </div>
      {d.subject && <div className="mt-1 font-medium text-gray-90">{d.subject}</div>}
      <p className="mt-1 whitespace-pre-line leading-[1.5] text-gray-80">{d.body}</p>
    </div>
  )
}

// An outbound draft reports its own outcome — the card IS the record of the
// message, so nothing is emitted afterwards.
const OUTBOUND_LABEL = { approved: 'outApproved', edited: 'outEdited', skipped: 'outSkipped' }
const statusLabel = (approval) =>
  copy.approvals[(approval.draft && OUTBOUND_LABEL[approval.status]) || approval.status]

// Shared by the in-thread card and the approvals panel.
export function ApprovalDecision({ approval, compact = false }) {
  const dispatch = useDispatch()
  const runner = useRunner()
  const botTrust = useStore((s) => s.bots.byId[approval.botId]?.trust)
  const okNote = botTrust === 'act' ? copy.approvals.needsOkAct : copy.approvals.needsOk
  const [editing, setEditing] = useState(false)
  const [edits, setEdits] = useState({})

  const decide = (decision) => {
    if (decision === 'edit' && approval.kind === 'schedule' && Object.keys(edits).length) {
      dispatch({ type: A.PATCH_DOC, payload: { docId: approval.preview.docId, op: 'editProposed', patch: edits } })
    }
    runner.resumeFromApproval(approval.id, decision)
    setEditing(false)
  }

  const decided = approval.status !== 'pending'
  return (
    <>
      {!decided && !compact && <div className="px-3 pt-2 text-[12px] text-gray-60">{approval.summary}</div>}
      <div className="py-1">
        <ApprovalBody approval={approval} editing={editing} edits={edits} setEdits={setEdits} />
      </div>
      <div className="border-t border-gray-10 px-3 py-2">
        {decided ? (
          <div className={`flex items-center gap-2 text-[12px] font-medium ${approval.status === 'skipped' ? 'text-gray-50' : 'text-success-fg'}`}>
            <span>{approval.status === 'skipped' ? '—' : '✓'}</span>
            <span>{statusLabel(approval)}</span>
            {approval.draft && approval.status !== 'skipped' && (
              <span className="ml-auto text-right text-[10.5px] font-normal text-gray-40">{copy.sent.signature(company.name)}</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {editing ? (
              <button onClick={() => decide('edit')} className="h-7 rounded-sm bg-navy-900 px-3 text-[12px] font-semibold text-white">{copy.approvals.saveApprove}</button>
            ) : (
              <>
                <button onClick={() => decide('approve')} className="h-7 rounded-sm bg-navy-900 px-3 text-[12px] font-semibold text-white">{copy.approvals.approve}</button>
                <button onClick={() => setEditing(true)} className="h-7 rounded-sm border border-gray-20 px-3 text-[12px] text-gray-80 hover:bg-gray-5">{copy.approvals.edit}</button>
              </>
            )}
            <button onClick={() => decide('skip')} className="h-7 rounded-sm px-2 text-[12px] text-gray-60 hover:text-gray-90">{copy.approvals.skip}</button>
            {!approval.native && <span className="ml-auto max-w-[260px] text-right text-[11px] leading-tight text-warning-fg">{okNote}</span>}
          </div>
        )}
      </div>
    </>
  )
}

export default function ApprovalCard({ message }) {
  const approvals = useStore(selectApprovals)
  const approval = approvals.find((a) => a.id === message.content?.approvalId)
  if (!approval) return null
  const decided = approval.status !== 'pending'
  return (
    <BotBlock botId={message.author}>
      <div className={`rounded-md border bg-white ${decided ? 'border-gray-15' : 'border-navy-900/30'}`}>
        <div className="flex items-center gap-2 border-b border-gray-10 px-3 py-2">
          <SourceBadge source={approval.native ? 'buildertrend' : 'browser'} />
          <span className="min-w-0 flex-1 text-[12.5px] font-semibold text-gray-90">{approval.title}</span>
          {decided && approval.draft && approval.status !== 'skipped' && (
            <span className="flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-success-fg"><span>✓</span>{copy.sent.sent}</span>
          )}
        </div>
        <ApprovalDecision approval={approval} />
      </div>
    </BotBlock>
  )
}
