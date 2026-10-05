import { useState } from 'react'
import { Z } from '../../constants'
import { copy, SCENARIO_LIST } from '../../data'
import { useStore, useDispatch, useRunner, useBuildbotsContext } from '../../store/useBuildbots'
import { selectUi } from '../../store/selectors'
import { A } from '../../store/actions'

function beatLabel(b, i) {
  const who = b.author === 'user' ? 'you' : b.author === 'system' ? 'sys' : b.author
  let text = ''
  if (typeof b.content === 'string') text = b.content
  else text = b.content?.title ?? b.content?.summary ?? b.content?.caption ?? b.content?.approvalId ?? b.kind
  const flags = [b.awaitUser && 'wait', b.awaitApproval && 'approval', b.label && `#${b.label}`].filter(Boolean).join(' ')
  return { i, who, kind: b.kind, text: text.length > 80 ? text.slice(0, 78) + '…' : text, flags }
}

// Hidden drawer. ⌘⇧D / Ctrl⇧D. Lists every scenario and jumps mid-flow.
export default function DevDrawer() {
  const ui = useStore(selectUi)
  const dispatch = useDispatch()
  const runner = useRunner()
  const { store } = useBuildbotsContext()
  const [openId, setOpenId] = useState(null)
  if (!ui.drawerOpen) return null

  const close = () => dispatch({ type: A.SET_UI, payload: { drawerOpen: false } })
  const runs = store.getState().engine.runs

  return (
    <>
      <div className={`fixed inset-0 bg-navy-900/20 ${Z.devDrawer}`} onClick={close} />
      <aside className={`fixed top-0 right-0 bottom-0 flex w-[460px] flex-col border-l border-gray-20 bg-white shadow-lg ${Z.devDrawer}`}>
        <div className="flex h-12 items-center gap-3 border-b border-gray-15 px-4">
          <span className="text-[13px] font-semibold text-gray-90">{copy.dev.title}</span>
          <span className="text-[11px] text-gray-50">{copy.dev.hint}</span>
          <button onClick={() => { runner.reset(); close() }} className="ml-auto h-7 rounded-sm border border-gray-20 px-2 text-[12px] text-danger-fg hover:bg-danger-bg">{copy.dev.reset}</button>
          <button onClick={close} className="h-7 rounded-sm border border-gray-20 px-2 text-[12px] text-gray-70 hover:bg-gray-5">{copy.dev.close}</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 text-[12px]">
          {SCENARIO_LIST.map((s) => {
            const run = runs[s.convId]
            const active = run?.scenarioId === s.id
            const isOpen = openId === s.id
            return (
              <div key={s.id} className="mb-1 rounded-md border border-gray-15">
                <button
                  onClick={() => setOpenId(isOpen ? null : s.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-5"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-brand-blue' : 'bg-gray-20'}`} />
                  <span className="flex-1 font-medium text-gray-90">{s.title}</span>
                  <span className="font-mono text-[10.5px] text-gray-40">{s.id}</span>
                  <span className="tabular-nums text-gray-50">{s.beats.length}</span>
                  {active && <span className="rounded-sm bg-info-bg px-1 text-[10px] text-info-fg">at {run.index}{run.waitingOn ? ` · ${run.waitingOn}` : ''}</span>}
                </button>
                {isOpen && (
                  <ol className="border-t border-gray-15">
                    {s.beats.map((b, i) => {
                      const l = beatLabel(b, i)
                      return (
                        <li key={i}>
                          <button
                            onClick={() => { runner.jumpTo(s.convId, s.id, i); close() }}
                            className="flex w-full items-start gap-2 px-3 py-1.5 text-left hover:bg-info-bg"
                          >
                            <span className="w-5 shrink-0 tabular-nums text-gray-40">{i}</span>
                            <span className="w-24 shrink-0 truncate font-mono text-[10.5px] text-gray-60">{l.who}</span>
                            <span className="w-14 shrink-0 text-[10.5px] uppercase text-gray-40">{l.kind}</span>
                            <span className="min-w-0 flex-1 truncate text-gray-80">{l.text}</span>
                            {l.flags && <span className="shrink-0 text-[10px] text-brand-blue">{l.flags}</span>}
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </div>
            )
          })}
        </div>
        <div className="max-h-28 overflow-y-auto border-t border-gray-15 bg-gray-5 px-3 py-2 font-mono text-[10.5px] text-gray-50">
          {store.getLog().slice(-12).join(' · ')}
        </div>
      </aside>
    </>
  )
}
