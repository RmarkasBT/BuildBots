import { ROSTER_W, RAIL_W } from '../../constants'
import { copy, shopForeman } from '../../data'
import { useStore, useDispatch, useRunner } from '../../store/useBuildbots'
import { selectRosterBots, selectCrews, selectUi, selectBots, selectConversation } from '../../store/selectors'
import { A } from '../../store/actions'
import BotAvatar from '../ui/BotAvatar'
import StatusDot from '../ui/StatusDot'

function IconChevron({ className, dir = 'left' }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} ${dir === 'right' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  )
}

function BotRow({ bot, active, collapsed, onSelect }) {
  const working = !!bot.working || bot.status === 'working'
  const sub = working && bot.workingLine ? bot.workingLine : bot.job
  return (
    <button
      onClick={onSelect}
      title={collapsed ? bot.name : undefined}
      className={`group flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left ${active ? 'bg-gray-10' : 'hover:bg-gray-5'} ${bot.isNew ? 'bb-slide-in' : ''}`}
    >
      <span className="relative shrink-0">
        <BotAvatar glyph={bot.avatar} size="sm" />
        <StatusDot status={bot.status} working={working} className="absolute -right-0.5 -bottom-0.5 ring-2 ring-white" />
      </span>
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold leading-tight text-gray-90">{bot.name}</span>
            <span className={`block truncate text-[11.5px] leading-tight ${working ? 'text-brand-blue' : 'text-gray-50'}`}>{sub}</span>
          </span>
          {bot.unread > 0 && (
            <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-blue px-1 text-[10px] font-semibold tabular-nums text-white">
              {bot.unread}
            </span>
          )}
        </>
      )}
    </button>
  )
}

function CrewRow({ crew, bots, active, collapsed, onSelect }) {
  const members = crew.botIds.map((id) => bots.byId[id]).filter(Boolean)
  return (
    <button
      onClick={onSelect}
      title={collapsed ? crew.name : undefined}
      className={`flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left ${active ? 'bg-gray-10' : 'hover:bg-gray-5'}`}
    >
      <span className="flex shrink-0 -space-x-2">
        {members.slice(0, collapsed ? 2 : 4).map((b) => (
          <BotAvatar key={b.id} glyph={b.avatar} size="xs" className="ring-2 ring-white" />
        ))}
      </span>
      {!collapsed && (
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold leading-tight text-gray-90">{crew.name}</span>
          <span className="block truncate text-[11.5px] leading-tight text-gray-50">{members.map((m) => m.name).join(', ')}</span>
        </span>
      )}
    </button>
  )
}

export default function Roster() {
  const bots = useStore(selectBots)
  const roster = useStore(selectRosterBots)
  const crews = useStore(selectCrews)
  const ui = useStore(selectUi)
  const dispatch = useDispatch()
  const runner = useRunner()
  const collapsed = ui.rosterCollapsed
  const foremanConv = useStore(selectConversation('shop-foreman'))

  const open = (convId, scenarioId) => {
    dispatch({ type: A.SELECT_CONV, payload: { convId } })
    if (scenarioId) runner.ensureStarted(convId, scenarioId)
  }

  const newBot = () => {
    // A fresh interview each time, unless one is already in progress.
    if (!foremanConv?.messageIds.length || runner.runs.get('shop-foreman')?.waitingOn === 'end') {
      runner.start('shop-foreman', shopForeman.entryScenarioId)
    }
    dispatch({ type: A.SELECT_CONV, payload: { convId: 'shop-foreman' } })
  }

  return (
    <aside
      style={{ width: collapsed ? RAIL_W : ROSTER_W }}
      className="flex shrink-0 flex-col border-r border-gray-15 bg-white transition-[width] duration-200"
    >
      <div className={`flex h-9 items-center ${collapsed ? 'justify-center' : 'justify-between px-3'}`}>
        {!collapsed && <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-50">{copy.roster.bots}</span>}
        <button
          onClick={() => dispatch({ type: A.TOGGLE_ROSTER })}
          title={collapsed ? copy.roster.expand : copy.roster.collapse}
          className="flex h-6 w-6 items-center justify-center rounded-sm text-gray-50 hover:bg-gray-5 hover:text-gray-80"
        >
          <IconChevron className="h-4 w-4" dir={collapsed ? 'right' : 'left'} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 pb-2">
        <ul className="space-y-0.5">
          {roster.map((bot) => (
            <li key={bot.id}>
              <BotRow
                bot={bot}
                active={ui.activeConvId === bot.id}
                collapsed={collapsed}
                onSelect={() => open(bot.id, bot.entryScenarioId)}
              />
            </li>
          ))}
        </ul>

        <div className={`mt-4 mb-1 ${collapsed ? 'border-t border-gray-15 pt-2' : 'px-2'}`}>
          {!collapsed && <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-50">{copy.roster.crews}</span>}
        </div>
        <ul className="space-y-0.5">
          {crews.map((crew) => (
            <li key={crew.id}>
              <CrewRow
                crew={crew}
                bots={bots}
                active={ui.activeConvId === crew.id}
                collapsed={collapsed}
                onSelect={() => open(crew.id, crew.entryScenarioId)}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className={`border-t border-gray-15 p-2 ${collapsed ? 'flex flex-col items-center gap-1' : 'space-y-1.5'}`}>
        <button
          onClick={newBot}
          title={copy.roster.newBot}
          className={`flex items-center justify-center gap-1.5 rounded-sm bg-brand-blue text-sm font-semibold text-white hover:bg-brand-blue/90 ${collapsed ? 'h-8 w-8' : 'h-8 w-full'}`}
        >
          <span className="text-base leading-none">+</span>
          {!collapsed && <span>{copy.roster.newBot}</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center justify-between px-1 text-[11.5px]">
            <button onClick={() => dispatch({ type: A.SET_UI, payload: { panel: 'catalog' } })} className="text-brand-blue hover:underline">
              {copy.roster.browse}
            </button>
            <button onClick={() => dispatch({ type: A.SET_UI, payload: { panel: 'connectors' } })} className="text-gray-60 hover:text-gray-90 hover:underline">
              {copy.roster.connectors}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
