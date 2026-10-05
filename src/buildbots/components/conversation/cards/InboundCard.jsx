import { copy } from '../../../data'
import { BotBlock } from '../Message'
import { ChannelIcon } from './SentCard'

// An inbound reply, quoted in the thread. How the SMS flow gets its second half.
export default function InboundCard({ message }) {
  const c = message.content ?? {}
  return (
    <BotBlock botId={message.author}>
      <div className="w-[440px] border-l-2 border-gray-30 bg-gray-5 px-3 py-2">
        <div className="flex items-center gap-2 text-[11.5px] text-gray-60">
          <ChannelIcon channel={c.channel} className="h-3.5 w-3.5 text-gray-50" />
          <span><span className="font-medium text-gray-80">{c.from}</span> {copy.sent.replied}</span>
          {c.when && <span className="ml-auto tabular-nums text-gray-40">{c.when}</span>}
        </div>
        <p className="mt-1 whitespace-pre-line text-[12.5px] leading-[1.5] text-gray-90">{c.body}</p>
      </div>
    </BotBlock>
  )
}
