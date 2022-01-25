import { IntGeoUnit } from './details'
import { DataVersionContext, GdiVariant } from './shared'

export interface InternationalQuarantineData extends DataVersionContext {
  data: QuarantineGeoData
}

export type QuarantineGeoData = {
  [key in IntGeoUnit]?: QuarantineGeoDataEntry
}

export interface QuarantineGeoDataEntry {
  [GdiVariant.QUARANTINE_START]?: string | null
  [GdiVariant.QUARANTINE_END]?: string | null
}
