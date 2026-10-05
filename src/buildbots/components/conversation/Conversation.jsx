import { useState, useEffect, useRef } from 'react'
import { copy } from '../../data'
import { useStore, useDispatch, useRunner } from '../../store/useBuildbots'
import { selectConversation, selectBots, selectCrew, selectUi } from '../../store/selectors'
import { A } from '../../store/actions'
import BotAvatar from '../ui/BotAvatar'
import StatusDot from '../ui/StatusDot'
import Thread from './Thread'
import Composer from './Composer'
import { setTrust } from '../../lib/trust'

// One click switches the mode; moving to Act asks once. The outbound rule
// is stated right here where the switch lives.
function TrustPill({ bot }) {
  const dispatch = useDispatch()
  const act = bot.trust === 'act'
  return (
    <button
      onClick={() => setTrust(dispatch, bot, act ? 'suggest' : 'act')}
      title={`${act ? copy.trust.actHelp : copy.trust.suggestHelp} ${copy.trust.rule}`}
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${act ? 'bg-navy-900 text-white hover:bg-navy-900/85' : 'border border-gray-25 text-gray-70 hover:border-navy-900 hover:text-gray-90'}`}
    >
      {copy.trust[bot.trust] ?? copy.trust.suggest}
    </button>
  )
}

function Overflow({ items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-sm text-gray-60 hover:bg-gray-5 hover:text-gray-90"
        title="More"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-md border border-gray-15 bg-white py-1 shadow-sm">
          {items.map((it) => (
            it === 'divider' ? <div key="d" className="my-1 h-px bg-gray-15" /> : (
              <button
                key={it.label}
                onClick={() => { setOpen(false); it.onClick?.() }}
                className={`block w-full px-3 py-1.5 text-left text-[12.5px] hover:bg-gray-5 ${it.danger ? 'text-danger-fg' : 'text-gray-80'}`}
              >
                {it.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default function Conversation({ renderers }) {
  const ui = useStore(selectUi)
  const convId = ui.activeConvId
  const conv = useStore(selectConversation(convId))
  const bots = useStore(selectBots)
  const crew = useStore(selectCrew(convId))
  const dispatch = useDispatch()
  const runner = useRunner()

  // Opening state: nothing selected, nothing running. The user picks a bot.
  if (!conv) {
    const waiting = bots.rosterIds.map((id) => bots.byId[id]).filter((b) => b.status === 'waiting' || b.unread > 0)
    return (
      <section className="flex min-w-0 flex-1 flex-col items-center justify-center bg-white px-8 text-center">
        <div className="text-[18px] font-bold tracking-tight text-gray-90">{copy.welcome.title}</div>
        <p className="mt-1 max-w-md text-[13px] text-gray-60">{copy.welcome.body}</p>
        {waiting.length > 0 && (
          <div className="mt-6 w-full max-w-md rounded-md border border-gray-15 bg-gray-5 p-3 text-left">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-50">{copy.welcome.waiting}</div>
            {waiting.map((b) => (
              <button
                key={b.id}
                onClick={() => { dispatch({ type: A.SELECT_CONV, payload: { convId: b.id } }); runner.ensureStarted(b.id, b.entryScenarioId) }}
                className="flex w-full items-center gap-3 rounded-sm bg-white px-3 py-2 text-left ring-1 ring-gray-15 hover:ring-navy-900"
              >
                <BotAvatar glyph={b.avatar} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-gray-90">{b.name}</span>
                  <span className="block truncate text-[11.5px] text-gray-50">{b.lastActivity}</span>
                </span>
                <StatusDot status={b.status} />
              </button>
            ))}
          </div>
        )}
        <p className="mt-6 text-[11.5px] text-gray-40">{copy.welcome.hint}</p>
      </section>
    )
  }

  const isCrew = conv.kind === 'crew'
  const members = conv.botIds.map((id) => bots.byId[id]).filter(Boolean)
  const lead = members[0]
  // The create flow's header is the bot being built, not the interviewer:
  // "New bot" until it has a name, no trust pill until it is created.
  const creating = convId === 'shop-foreman'
  const draft = conv.draftBot ?? {}
  const title = creating
    ? (draft.name ?? copy.preview.unnamed)
    : isCrew ? (crew?.name ?? members.map((m) => m.name).join(' + ')) : lead?.name
  const subtitle = creating ? (draft.job ?? copy.preview.noJob) : isCrew ? members.map((m) => m.name).join(' · ') : lead?.job

  const panel = (name) => dispatch({ type: A.SET_UI, payload: { panel: name } })
  const reset = () => {
    if (window.confirm(copy.header.resetConfirm)) runner.reset()
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-gray-15 px-5">
        {isCrew ? (
          <span className="flex -space-x-2">
            {members.map((m) => <BotAvatar key={m.id} glyph={m.avatar} size="sm" className="ring-2 ring-white" />)}
          </span>
        ) : creating ? (
          <BotAvatar glyph={draft.avatar ?? 'grid'} size="sm" muted={!draft.name} />
        ) : (
          <span className="relative">
            <BotAvatar glyph={lead?.avatar} size="sm" />
            <StatusDot status={lead?.status} working={lead?.working} className="absolute -right-0.5 -bottom-0.5 ring-2 ring-white" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className={`truncate text-[14px] font-semibold ${creating && !draft.name ? 'text-gray-50' : 'text-gray-90'}`}>{title}</h1>
            {!isCrew && !creating && lead && <TrustPill bot={lead} />}
          </div>
          <div className="truncate text-[11.5px] text-gray-50">{subtitle}</div>
        </div>
        {isCrew && (
          <button className="h-7 rounded-sm border border-gray-20 px-2 text-[12px] text-gray-70 hover:bg-gray-5">{copy.header.addBot}</button>
        )}
        {convId === 'shop-foreman' && (
          <button
            onClick={() => dispatch({ type: A.SET_VOICE, payload: { convId, voice: !conv.voice } })}
            title={copy.header.voiceHelp}
            className={`flex h-7 items-center gap-1.5 rounded-sm border px-2 text-[12px] ${conv.voice ? 'border-brand-blue bg-info-bg text-info-fg' : 'border-gray-20 text-gray-70 hover:bg-gray-5'}`}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
            {conv.voice ? copy.header.voiceOn : copy.header.voiceOff}
          </button>
        )}
        <Overflow
          items={[
            { label: copy.header.settings, onClick: () => panel('settings') },
            { label: copy.header.knowledge, onClick: () => panel('knowledge') },
            { label: copy.header.routines, onClick: () => panel('routines') },
            { label: isCrew ? copy.header.saveCrew : copy.header.duplicate, onClick: () => panel('settings') },
            'divider',
            { label: copy.header.reset, onClick: reset, danger: true },
          ]}
        />
      </div>

      <Thread convId={convId} renderers={renderers} />
      <Composer key={convId} convId={convId} crew={isCrew} />
    </section>
  )
}
