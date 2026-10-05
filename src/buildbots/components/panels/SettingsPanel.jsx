import { copy, triggerKinds } from '../../data'
import { useStore, useDispatch } from '../../store/useBuildbots'
import { selectUi, selectBots, selectRoutines } from '../../store/selectors'
import { A } from '../../store/actions'
import BotAvatar from '../ui/BotAvatar'
import { PanelShell } from './KnowledgePanel'
import { setTrust } from '../../lib/trust'

function Toggle({ on, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${on ? 'bg-navy-900' : 'bg-gray-20'} ${disabled ? 'opacity-50' : ''}`}
    >
      <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${on ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
    </button>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-50">{title}</h3>
      {children}
    </section>
  )
}

export default function SettingsPanel() {
  const ui = useStore(selectUi)
  const bots = useStore(selectBots)
  const dispatch = useDispatch()
  const bot = bots.byId[ui.activeConvId]
  const routines = useStore(selectRoutines(bot?.id))
  if (ui.panel !== 'settings' || !bot) return null
  const s = copy.settings
  const close = () => dispatch({ type: A.SET_UI, payload: { panel: null } })
  const setChannel = (key, on) => dispatch({ type: A.PATCH_BOT, payload: { botId: bot.id, patch: { channels: { ...bot.channels, [key]: on } } } })

  const duplicate = () => {
    const id = `${bot.id}-copy`
    if (bots.byId[id]) return
    dispatch({ type: A.ADD_BOT, payload: { bot: { ...bot, id, name: `${bot.name} (copy)`, status: 'idle', unread: 0, isNew: true, lastActivity: null, entryScenarioId: bot.entryScenarioId } } })
    dispatch({ type: A.ADD_BOT_TO_ROSTER, payload: { botId: id } })
    close()
  }

  return (
    <PanelShell title={s.title} subtitle={bot.name} onClose={close} width={520}>
      <div className="mb-5 flex items-center gap-3">
        <BotAvatar glyph={bot.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold text-gray-90">{bot.name}</div>
          <div className="text-[12.5px] text-gray-60">{bot.job}</div>
        </div>
        <button onClick={duplicate} className="h-7 shrink-0 rounded-sm border border-gray-20 px-2.5 text-[12px] text-gray-80 hover:bg-gray-5">{copy.header.duplicate}</button>
      </div>

      <Section title={s.trust}>
        <div className="rounded-md border border-gray-15 bg-white">
          {['suggest', 'act'].map((t) => (
            <button
              key={t}
              onClick={() => setTrust(dispatch, bot, t)}
              className={`flex w-full items-start gap-3 border-b border-gray-10 px-3 py-2.5 text-left last:border-b-0 ${bot.trust === t ? 'bg-gray-5' : 'hover:bg-gray-5/60'}`}
            >
              <span className={`mt-1 h-3 w-3 shrink-0 rounded-full border ${bot.trust === t ? 'border-navy-900 bg-navy-900 ring-2 ring-white ring-inset' : 'border-gray-30'}`} />
              <span>
                <span className="block text-[12.5px] font-semibold text-gray-90">{copy.trust[t]}</span>
                <span className="block text-[11.5px] text-gray-60">{t === 'act' ? copy.trust.actHelp : copy.trust.suggestHelp}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 px-1 text-[11.5px] leading-[1.5] text-gray-60">{copy.trust.rule}</p>
      </Section>

      <Section title={s.channels}>
        <div className="rounded-md border border-gray-15 bg-white">
          {[['email', s.email], ['sms', s.sms], ['social', s.social]].map(([key, label]) => (
            <div key={key} className="flex items-center gap-3 border-b border-gray-10 px-3 py-2.5 last:border-b-0">
              <span className="flex-1 text-[12.5px] text-gray-90">{label}</span>
              <Toggle on={!!bot.channels?.[key]} onChange={(on) => setChannel(key, on)} />
            </div>
          ))}
        </div>
        <p className="mt-2 px-1 text-[11.5px] leading-[1.5] text-gray-60">{s.identity}</p>
      </Section>

      <Section title={s.knowledge}>
        <ul className="rounded-md border border-gray-15 bg-white">
          {(bot.knowledge ?? []).map((k) => (
            <li key={k} className="flex items-center gap-2 border-b border-gray-10 px-3 py-2 text-[12.5px] text-gray-80 last:border-b-0">
              <span className="h-1.5 w-1.5 rounded-full bg-success-fg" />{k}
            </li>
          ))}
        </ul>
        <button onClick={() => dispatch({ type: A.SET_UI, payload: { panel: 'knowledge' } })} className="mt-2 px-1 text-[11.5px] text-brand-blue hover:underline">{s.manageKnowledge}</button>
      </Section>

      <Section title={s.routines}>
        {routines.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-20 px-3 py-4 text-center text-[12px] text-gray-50">{s.noRoutines}</div>
        ) : (
          <ul className="rounded-md border border-gray-15 bg-white">
            {routines.map((r) => (
              <li key={r.id} className="flex items-center gap-3 border-b border-gray-10 px-3 py-2 last:border-b-0">
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium text-gray-90">{r.name}</span>
                  <span className="block text-[11px] text-gray-50">{r.trigger.label}</span>
                </span>
                <span className="shrink-0 rounded-sm bg-gray-10 px-1.5 py-0.5 text-[10.5px] text-gray-60">{triggerKinds.find((t) => t.kind === r.trigger.kind)?.label}</span>
                <span className="shrink-0 text-[11px] tabular-nums text-gray-50">{r.lastRun}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 px-1 text-[11.5px] text-gray-60">{s.routinesHint}</p>
      </Section>
    </PanelShell>
  )
}
