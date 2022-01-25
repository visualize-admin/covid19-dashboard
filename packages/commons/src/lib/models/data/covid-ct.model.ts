import { OverviewCardV3 } from './overview-card.model'
import { GdiObject, GdiVariant, InlineValues } from './shared'

export type CovidCtDailyDataValues = GdiVariant.VALUE_CT_ISO | GdiVariant.VALUE_CT_QUA | GdiVariant.VALUE_CT_ENTRY

export interface CovidCtOverviewCardV3 extends OverviewCardV3<InlineValues<CovidCtDailyDataValues>, undefined> {
  gdiObject: GdiObject.CT
  reportingCantons: number
}
