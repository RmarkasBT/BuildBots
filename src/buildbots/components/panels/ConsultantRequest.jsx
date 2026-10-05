import { useState } from 'react'
import { Z } from '../../constants'
import { copy, currentUser, company } from '../../data'
import { useStore, useDispatch, useRunner } from '../../store/useBuildbots'
import { selectUi } from '../../store/selectors'
import { A } from '../../store/actions'

// Simple request panel with a confirmation state. Appears only after a real
// SOP gap surfaced in the work, never as a banner.
export default function ConsultantRequest() {
  const ui = useStore(selectUi)
  const dispatch = useDispatch()
  const runner = useRunner()
  const [sent, setSent] = useState(false)
  if (ui.panel !== 'consultant') return null
  const c = copy.consultant
  const ctx = ui.panelContext ?? {}

  const close = () => {
    dispatch({ type: A.SET_UI, payload: { panel: null, panelContext: null } })
    if (sent && ctx.convId) runner.gotoLabel(ctx.convId, ctx.resumeLabel)
  }
  const send = () => {
    setSent(true)
    dispatch({ type: A.KNOWLEDGE_BRANCH, payload: { branch: 'consultant' } })
  }

  return (
    <>
      <div className={`absolute inset-0 bg-navy-900/20 ${Z.liveScrim}`} onClick={close} />
      <div className={`absolute left-1/2 top-24 w-[480px] -translate-x-1/2 rounded-md border border-gray-20 bg-white shadow-lg ${Z.panel}`}>
        <div className="flex items-center gap-2 border-b border-gray-15 px-4 py-3">
          <span className="text-[13px] font-semibold text-gray-90">{c.title}</span>
          <button onClick={close} className="ml-auto flex h-7 w-7 items-center justify-center rounded-sm text-gray-60 hover:bg-gray-5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        {sent ? (
          <div className="px-4 py-6 text-center">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-success-bg text-success-fg">✓</div>
            <div className="mt-3 text-[13.5px] font-semibold text-gray-90">{c.sentTitle}</div>
            <p className="mt-1 text-[12.5px] text-gray-60">{c.sentBody}</p>
            <button onClick={close} className="mt-4 h-8 rounded-sm bg-navy-900 px-4 text-[12.5px] font-semibold text-white">{c.done}</button>
          </div>
        ) : (
          <div className="px-4 py-3">
            <p className="text-[12.5px] leading-[1.5] text-gray-70">{c.body}</p>
            <dl className="mt-3 divide-y divide-gray-10 rounded-md border border-gray-15 text-[12.5px]">
              <div className="grid grid-cols-[110px_1fr] gap-3 px-3 py-1.5"><dt className="text-gray-50">{c.process}</dt><dd className="text-gray-90">{ctx.sopTitle ?? '—'}</dd></div>
              <div className="grid grid-cols-[110px_1fr] gap-3 px-3 py-1.5"><dt className="text-gray-50">{c.company}</dt><dd className="text-gray-90">{company.name}</dd></div>
              <div className="grid grid-cols-[110px_1fr] gap-3 px-3 py-1.5"><dt className="text-gray-50">{c.contact}</dt><dd className="text-gray-90">{currentUser.name}, {currentUser.role}</dd></div>
              <div className="grid grid-cols-[110px_1fr] gap-3 px-3 py-1.5"><dt className="text-gray-50">{c.format}</dt><dd className="text-gray-90">{c.formatValue}</dd></div>
            </dl>
            <label className="mt-3 block">
              <span className="mb-1 block text-[11px] font-medium text-gray-60">{c.notes}</span>
              <textarea rows={2} defaultValue={ctx.notes ?? ''} className="w-full resize-none rounded-sm border border-gray-20 px-2 py-1.5 text-[12.5px] outline-none focus:border-brand-blue" />
            </label>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={send} className="h-8 rounded-sm bg-navy-900 px-4 text-[12.5px] font-semibold text-white">{c.send}</button>
              <button onClick={close} className="h-8 rounded-sm border border-gray-20 px-3 text-[12.5px] text-gray-70">{c.cancel}</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
