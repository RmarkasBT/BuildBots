import { Z } from '../../constants'
import { copy } from '../../data'
import { useStore, useDispatch, useRunner } from '../../store/useBuildbots'
import { selectUi, selectBots } from '../../store/selectors'
import { A } from '../../store/actions'
import BotAvatar from '../ui/BotAvatar'
import SourceBadge from '../ui/SourceBadge'

// Prebuilt Buildertrend bots. Six already in the roster; the rest are a
// click away. Prebuilt bots arrive wired into Buildertrend's MCP and APIs.
const WORKS = { native: 'buildertrend', browser: 'browser', mixed: 'mixed' }

export default function CatalogGallery() {
  const ui = useStore(selectUi)
  const bots = useStore(selectBots)
  const dispatch = useDispatch()
  const runner = useRunner()
  if (ui.panel !== 'catalog') return null
  const close = () => dispatch({ type: A.SET_UI, payload: { panel: null } })
  const all = [...bots.rosterIds, ...bots.catalogIds].map((id) => bots.byId[id]).filter((b) => b && b.id !== 'warranty')
  const add = (bot) => {
    dispatch({ type: A.ADD_BOT_TO_ROSTER, payload: { botId: bot.id } })
    dispatch({ type: A.SELECT_CONV, payload: { convId: bot.id } })
    runner.ensureStarted(bot.id, bot.entryScenarioId)
    close()
  }

  return (
    <>
      <div className={`absolute inset-0 bg-navy-900/20 ${Z.liveScrim}`} onClick={close} />
      <div className={`absolute left-1/2 top-12 w-[880px] -translate-x-1/2 rounded-md border border-gray-20 bg-white shadow-lg ${Z.panel}`}>
        <div className="flex items-center gap-3 border-b border-gray-15 px-5 py-3">
          <span className="text-[13px] font-semibold text-gray-90">{copy.catalog.title}</span>
          <span className="text-[11.5px] text-gray-50">{copy.catalog.subtitle}</span>
          <button onClick={close} className="ml-auto flex h-7 w-7 items-center justify-center rounded-sm text-gray-60 hover:bg-gray-5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="grid max-h-[70vh] grid-cols-3 gap-2 overflow-y-auto p-5">
          {all.map((b) => {
            const inRoster = bots.rosterIds.includes(b.id)
            return (
              <div key={b.id} className="flex flex-col rounded-md border border-gray-15 bg-white p-3">
                <div className="flex items-start gap-2.5">
                  <BotAvatar glyph={b.avatar} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-semibold text-gray-90">{b.name}</span>
                    <span className="block text-[11.5px] leading-snug text-gray-60">{b.job}</span>
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {(WORKS[b.works] === 'mixed' ? ['buildertrend', 'browser'] : [WORKS[b.works]]).map((s) => <SourceBadge key={s} source={s} />)}
                  <span className="rounded-sm border border-gray-20 px-1.5 py-0.5 text-[10.5px] text-gray-60">{copy.trust[b.trust]}</span>
                </div>
                <ul className="mt-2 flex-1 space-y-0.5 text-[11px] text-gray-50">
                  {(b.knowledge ?? []).slice(0, 3).map((k) => <li key={k} className="truncate">· {k}</li>)}
                </ul>
                <div className="mt-3">
                  {inRoster ? (
                    <span className="text-[11.5px] text-gray-50">{copy.catalog.inRoster}</span>
                  ) : (
                    <button onClick={() => add(b)} className="h-7 rounded-sm bg-navy-900 px-3 text-[12px] font-semibold text-white">{copy.catalog.add}</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="border-t border-gray-15 bg-gray-5 px-5 py-2.5 text-[11.5px] text-gray-60">{copy.catalog.note}</div>
      </div>
    </>
  )
}
