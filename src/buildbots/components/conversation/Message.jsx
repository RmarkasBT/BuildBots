import { useState } from 'react'
import { copy, currentUser } from '../../data'
import { useStore } from '../../store/useBuildbots'
import { selectBot } from '../../store/selectors'
import BotAvatar from '../ui/BotAvatar'
import { RENDERERS } from './registry'

// Bot messages are left-aligned blocks with a name line, not bubbles.
// The user's messages are right-aligned and subtly tinted.

function Author({ botId, showName = true }) {
  const bot = useStore(selectBot(botId))
  return (
    <div className="flex items-center gap-2">
      <BotAvatar glyph={bot?.avatar} size="xs" />
      {showName && <span className="text-[12px] font-semibold text-gray-80">{bot?.name ?? botId}</span>}
    </div>
  )
}

export function BotBlock({ botId, children, sources }) {
  return (
    <div className="bb-msg-in max-w-[720px]">
      <Author botId={botId} />
      <div className="mt-1 pl-8 text-[13.5px] leading-[1.5] text-gray-90">{children}</div>
      {sources?.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1 pl-8">
          {sources.map((s) => (
            <span key={s} className="rounded-sm border border-gray-20 bg-gray-5 px-1.5 py-0.5 text-[10.5px] text-gray-60">{s}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export function UserBlock({ children }) {
  return (
    <div className="bb-msg-in flex justify-end">
      <div className="max-w-[560px] rounded-md bg-info-bg px-3 py-2 text-[13.5px] leading-[1.5] text-gray-90">
        <span className="mr-2 text-[11px] font-semibold text-info-fg">{currentUser.name}</span>
        {children}
      </div>
    </div>
  )
}

export function SystemLine({ children }) {
  return (
    <div className="bb-msg-in flex items-center gap-3 py-0.5 text-[11.5px] text-gray-50">
      <span className="h-px flex-1 bg-gray-15" />
      <span className="shrink-0">{children}</span>
      <span className="h-px flex-1 bg-gray-15" />
    </div>
  )
}

export function ThinkingLine({ botId, content }) {
  const [open, setOpen] = useState(false)
  const steps = content?.steps ?? []
  return (
    <div className="bb-msg-in max-w-[720px]">
      <Author botId={botId} showName={false} />
      <div className="-mt-5 pl-8">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-[12px] text-gray-60 hover:text-gray-90"
        >
          <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
          <span className="font-medium">{copy.thinking.done}:</span>
          <span className="truncate">{content?.summary}</span>
        </button>
        {open && (
          <ol className="mt-1.5 space-y-1 border-l border-gray-20 pl-3 text-[12.5px] text-gray-70">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-4 shrink-0 tabular-nums text-gray-40">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

export function TypingLine({ botId }) {
  const bot = useStore(selectBot(botId))
  return (
    <div className="bb-msg-in flex items-center gap-2">
      <BotAvatar glyph={bot?.avatar} size="xs" />
      <span className="text-[12px] text-gray-50">{bot?.name} {copy.composer.typingSuffix}</span>
      <span className="flex items-center gap-0.5">
        <span className="bb-dot h-1 w-1 rounded-full bg-gray-40" />
        <span className="bb-dot h-1 w-1 rounded-full bg-gray-40 [animation-delay:150ms]" />
        <span className="bb-dot h-1 w-1 rounded-full bg-gray-40 [animation-delay:300ms]" />
      </span>
    </div>
  )
}

// Cards register themselves in registry.js so this file does not import
// them (avoids a cycle with BotBlock). Later phases add browser, sent,
// inbound and card renderers.
export default function Message({ message, renderers = {} }) {
  const { author, kind, content } = message
  const Custom = renderers[kind] ?? RENDERERS[kind]
  if (Custom) return <Custom message={message} />

  if (author === 'user') return <UserBlock>{content}</UserBlock>
  if (kind === 'notice' || kind === 'handoff') {
    return <SystemLine>{typeof content === 'string' ? content : content?.text}</SystemLine>
  }
  if (kind === 'thinking') return <ThinkingLine botId={author} content={content} />
  if (kind === 'text') return <BotBlock botId={author} sources={message.sources}>{content}</BotBlock>

  // Unknown kind in this phase: show it plainly rather than drop it.
  return (
    <BotBlock botId={author}>
      <span className="text-gray-50">[{kind}]</span> {typeof content === 'string' ? content : content?.title ?? content?.caption ?? ''}
    </BotBlock>
  )
}
