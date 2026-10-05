import { copy } from '../data'
import { A } from '../store/actions'

// Trust mode is one setting with two values. Switching to Act asks once.
// Outbound messages need an OK in both modes; that rule lives in copy.trust.rule.
export function setTrust(dispatch, bot, trust) {
  if (!bot || trust === bot.trust) return
  if (trust === 'act' && !window.confirm(copy.trust.confirmAct)) return
  dispatch({ type: A.PATCH_BOT, payload: { botId: bot.id, patch: { trust } } })
}
