import { company, copy } from '../../../data'
import { BotBlock } from '../Message'

export function ChannelIcon({ channel, className = 'h-3.5 w-3.5' }) {
  if (channel === 'email') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M3 7l9 6 9-6" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M4 5h16v11H9l-5 4z" />
    </svg>
  )
}

// A message the bot sent after approval: recipient, channel, body, sent state.
export default function SentCard({ message }) {
  const c = message.content ?? {}
  return (
    <BotBlock botId={message.author}>
      <div className="w-[440px] rounded-md border border-gray-15 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-10 px-3 py-2 text-[11.5px] text-gray-60">
          <ChannelIcon channel={c.channel} className="h-3.5 w-3.5 text-gray-50" />
          <span>{c.channel === 'email' ? 'Email' : 'Text'} to <span className="font-medium text-gray-80">{c.to}</span></span>
          <span className="ml-auto flex items-center gap-1 text-success-fg"><span>✓</span>{copy.sent.sent}</span>
        </div>
        {c.subject && <div className="px-3 pt-2 text-[12.5px] font-medium text-gray-90">{c.subject}</div>}
        <p className="whitespace-pre-line px-3 py-2 text-[12.5px] leading-[1.5] text-gray-80">{c.body}</p>
        <div className="border-t border-gray-10 px-3 py-1.5 text-[10.5px] text-gray-40">{copy.sent.signature(company.name)}</div>
      </div>
    </BotBlock>
  )
}
