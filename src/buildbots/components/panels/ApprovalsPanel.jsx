import { Z } from '../../constants'
import { copy, jobById } from '../../data'
import { useStore, useDispatch } from '../../store/useBuildbots'
import { selectApprovals, selectBots, selectUi } from '../../store/selectors'
import { A } from '../../store/actions'
import BotAvatar from '../ui/BotAvatar'
import SourceBadge from '../ui/SourceBadge'
import { ApprovalDecision } from '../conversation/cards/ApprovalCard'

// Approval queue from the top-bar bell. Each item: the bot, what it wants to
// do, the draft, the job. Approving produces a consequence elsewhere.
export default function ApprovalsPanel() {
  const ui = useStore(selectUi)
  const items = useStore(selectApprovals)
  const bots = useStore(selectBots)
  const dispatch = useDispatch()
  if (ui.panel !== 'approvals') return null

  const close = () => dispatch({ type: A.SET_UI, payload: { panel: null } })
  const pending = items.filter((a) => a.status === 'pending')
  const done = items.filter((a) => a.status !== 'pending')

  return (
    <>
      <div className={`absolute inset-0 ${Z.liveScrim}`} onClick={close} />
      <aside className={`absolute top-0 right-0 bottom-0 flex w-[520px] flex-col border-l border-gray-15 bg-white shadow-sm ${Z.panel}`}>
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-15 px-4">
          <span className="text-[13px] font-semibold text-gray-90">{copy.approvals.title}</span>
          <span className="rounded-full bg-gray-10 px-1.5 text-[11px] tabular-nums text-gray-60">{pending.length}</span>
          <button onClick={close} className="ml-auto flex h-7 w-7 items-center justify-center rounded-sm text-gray-60 hover:bg-gray-5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {pending.length === 0 && <div className="px-1 py-6 text-center text-[12.5px] text-gray-50">{copy.approvals.empty}</div>}
          {[...pending, ...done].map((a) => {
            const bot = bots.byId[a.botId]
            const job = jobById[a.jobId]
            return (
              <div key={a.id} className={`mb-2 rounded-md border bg-white ${a.status === 'pending' ? 'border-gray-20' : 'border-gray-15 opacity-70'}`}>
                <div className="flex items-center gap-2 border-b border-gray-10 px-3 py-2">
                  <BotAvatar glyph={bot?.avatar} size="xs" />
                  <span className="text-[12px] font-semibold text-gray-80">{bot?.name ?? a.botId}</span>
                  <SourceBadge source={a.native ? 'buildertrend' : 'browser'} className="ml-1" />
                  {job && <span className="ml-auto truncate text-[11px] text-gray-50">{job.name}</span>}
                </div>
                <div className="px-3 pt-2 text-[12.5px] font-medium text-gray-90">{a.title}</div>
                <ApprovalDecision approval={a} compact />
              </div>
            )
          })}
        </div>
      </aside>
    </>
  )
}
