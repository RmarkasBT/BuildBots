import { useStore } from '../../store/useBuildbots'
import { selectDoc } from '../../store/selectors'
import ScheduleDoc from './docs/ScheduleDoc'
import SourceDoc from './docs/SourceDoc'
import SopDoc from './docs/SopDoc'
import PlanSetDoc from './docs/PlanSetDoc'
import BidPackageDoc from './docs/BidPackageDoc'

// Later phases register estimate, takeoff, daily log, report, bid compare.
const DOCS = {
  schedule: ScheduleDoc,
  source: SourceDoc,
  sop: SopDoc,
  planset: PlanSetDoc,
  bidpackage: BidPackageDoc,
}

export default function DocumentMode({ target }) {
  const doc = useStore(selectDoc(target.targetId))
  if (!doc) return <div className="p-6 text-sm text-gray-40">Document not found: {target.targetId}</div>
  const Doc = DOCS[doc.type]
  if (!Doc) return <div className="p-6 text-sm text-gray-40">No renderer for {doc.type}</div>
  return <Doc doc={doc} />
}
