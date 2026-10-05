// Registers card renderers with Message. Imported once by Thread.
import { registerRenderer } from '../registry'
import ActionCard from './ActionCard'
import ApprovalCard from './ApprovalCard'
import ArtifactCard from './ArtifactCard'
import SentCard from './SentCard'
import InboundCard from './InboundCard'
import ChoiceCard from './ChoiceCard'
import UserFileCard from './UserFileCard'
import TradesCard from './TradesCard'
import BidDraftsCard from './BidDraftsCard'

registerRenderer('card', ChoiceCard)
registerRenderer('file', UserFileCard)
registerRenderer('trades', TradesCard)
registerRenderer('drafts', BidDraftsCard)
registerRenderer('action', ActionCard)
registerRenderer('browser', ActionCard)
registerRenderer('approval', ApprovalCard)
registerRenderer('artifact', ArtifactCard)
registerRenderer('sent', SentCard)
registerRenderer('inbound', InboundCard)
