import {
  DataTimespanContext,
  DataVersionContext,
  GdiObject,
  GdiVariant,
  InlineValues,
  TimeFrames,
  TimelineValues,
} from './shared'

// always timeframe 14d
export type InternationalComparisonDailyValuesCases = GdiVariant.ROLLSUM_14D | GdiVariant.INZ_ROLLSUM_14D

// always timeframe all
export type InternationalComparisonDetailDataTimelineValues = GdiVariant.INZ_ROLLSUM_14D | GdiVariant.INZ_ROLLSUM_14D_CH

export interface InternationalComparisonDetailGeoData extends DataTimespanContext {
  geoData: InternationalComparisonGeoData
}

export interface InternationalComparisonDetailData extends DataVersionContext {
  values: TimelineValues<InternationalComparisonDetailDataTimelineValues>[]
  timeframes: TimeFrames
}

// scoped by GdiObject because tests might be integrated in the same map data in the future
export interface InternationComparisonDailyValues {
  [GdiObject.CASE]: InlineValues<InternationalComparisonDailyValuesCases>
}

export type InternationalComparisonGeoData = {
  [key: string]: InternationComparisonDailyValues
}
