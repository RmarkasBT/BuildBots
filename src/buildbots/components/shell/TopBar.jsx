import { Link } from 'react-router-dom'
import { PRODUCT_NAME } from '../../constants'
import { company, copy } from '../../data'
import { useStore, useDispatch } from '../../store/useBuildbots'
import { selectPendingApprovals, selectUi } from '../../store/selectors'
import { A } from '../../store/actions'

// Stacked layers — knowledge sits in layers, and it reads nothing like a
// chat bubble or a book.
function IconKnowledge({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
      <path d="m3 12 9 4.5L21 12" />
      <path d="m3 16.5 9 4.5 9-4.5" />
    </svg>
  )
}

function IconBell({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  )
}

export default function TopBar() {
  const pending = useStore(selectPendingApprovals)
  const ui = useStore(selectUi)
  const dispatch = useDispatch()
  const approvalsOpen = ui.panel === 'approvals'
  const knowledgeOpen = ui.panel === 'knowledge' && ui.panelContext?.global

  return (
    <header className="flex h-12 shrink-0 items-center border-b border-gray-15 bg-white px-4">
      <div className="flex w-[260px] items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-navy-900 text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <rect x="4" y="4" width="7" height="7" />
            <rect x="13" y="4" width="7" height="7" />
            <rect x="4" y="13" width="7" height="7" />
            <rect x="13" y="13" width="7" height="7" opacity=".45" />
          </svg>
        </span>
        <span className="text-sm font-bold tracking-tight text-gray-90">{PRODUCT_NAME}</span>
      </div>

      <div className="flex-1 text-center text-sm font-medium text-gray-70">{company.name}</div>

      <div className="flex w-[480px] items-center justify-end gap-2">
        <button
          onClick={() => dispatch({ type: A.SET_UI, payload: { panel: knowledgeOpen ? null : 'knowledge', panelContext: { global: true } } })}
          className={`flex h-8 items-center gap-2 rounded-sm border px-2.5 text-sm ${knowledgeOpen ? 'border-navy-900 bg-navy-900 text-white' : 'border-gray-20 text-gray-80 hover:bg-gray-5'}`}
        >
          <IconKnowledge className="h-4 w-4" />
          <span>{copy.topBar.knowledge}</span>
        </button>
        <button
          onClick={() => dispatch({ type: A.SET_UI, payload: { panel: approvalsOpen ? null : 'approvals' } })}
          className={`relative flex h-8 items-center gap-2 rounded-sm border px-2.5 text-sm ${approvalsOpen ? 'border-navy-900 bg-navy-900 text-white' : 'border-gray-20 text-gray-80 hover:bg-gray-5'}`}
        >
          <IconBell className="h-4 w-4" />
          <span>{copy.topBar.approvals}</span>
          {pending.length > 0 && (
            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-warning-fg px-1.5 text-[11px] font-semibold tabular-nums text-white">
              {pending.length}
            </span>
          )}
        </button>
        <Link
          to="/"
          className="flex h-8 items-center rounded-sm border border-gray-20 px-2.5 text-sm text-gray-80 hover:bg-gray-5"
        >
          {copy.topBar.back}
        </Link>
      </div>
    </header>
  )
}
