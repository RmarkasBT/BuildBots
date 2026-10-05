import { useLayoutEffect, useRef } from 'react'
import { useStore } from '../../store/useBuildbots'
import { selectMessages, selectConversation, selectLive } from '../../store/selectors'
import Message, { TypingLine } from './Message'
import './cards'

export default function Thread({ convId, renderers }) {
  const messages = useStore(selectMessages(convId))
  const conv = useStore(selectConversation(convId))
  const live = useStore(selectLive)
  const scrollRef = useRef(null)
  const endRef = useRef(null)
  const stickRef = useRef(true)

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  // Follow the bottom unless the viewer has scrolled up to read.
  useLayoutEffect(() => {
    if (stickRef.current) endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, conv?.typing, live.open, convId])

  return (
    <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-6 py-4">
      <div className="mx-auto flex max-w-[860px] flex-col gap-4">
        {messages.map((m) => (
          <Message key={m.id} message={m} renderers={renderers} />
        ))}
        {conv?.typing && <TypingLine botId={conv.typing} />}
        <div ref={endRef} className="h-px" />
      </div>
    </div>
  )
}
