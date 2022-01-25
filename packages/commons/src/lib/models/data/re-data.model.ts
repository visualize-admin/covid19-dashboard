import { CantonGeoUnit, TopLevelGeoUnit } from './details'
import { OverviewCardV3 } from './overview-card.model'
import { DataVersionContext, GdiObject, GdiVariant, TimeFrames, TimelineValues } from './shared'

export interface ReGeographyUnitData {
  currentEntry: TimelineValues<GdiVariant.MEDIAN_R_MEAN>
  previousEntries: TimelineValues<GdiVariant.MEDIAN_R_MEAN>[]
}

export interface ReGeography {
  sourceDate: string
  data: {
    [key in CantonGeoUnit | TopLevelGeoUnit.CH]: ReGeographyUnitData
  }
}

export type ReBaseDevelopmentValues = GdiVariant.MEDIAN_R_MEAN | GdiVariant.MEDIAN_R_HIGH | GdiVariant.MEDIAN_R_LOW
export type ReDevelopmentValues = ReBaseDevelopmentValues | GdiVariant.MEDIAN_R_MEAN_CH

export type ReDailyValues =
  | GdiVariant.MEDIAN_R_MEAN
  | GdiVariant.MEDIAN_R_HIGH
  | GdiVariant.MEDIAN_R_LOW
  | GdiVariant.MEDIAN_R_MEAN_ROLLMEAN_7D

export interface ReDevelopment extends DataVersionContext {
  values: TimelineValues<ReDevelopmentValues>[]
  timeframes: TimeFrames
}

export type OverviewTimelineDataRe = TimelineValues<ReBaseDevelopmentValues>

export interface CovidReOverviewCardV3 extends OverviewCardV3<TimelineValues<ReDailyValues>, OverviewTimelineDataRe> {
  gdiObject: GdiObject.RE
}
