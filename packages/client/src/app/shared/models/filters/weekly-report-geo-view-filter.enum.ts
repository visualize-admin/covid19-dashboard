import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

// order matters for ui
export enum WeeklyReportGeoViewFilter {
  MAP = 'map',
  CHART = 'chart',
  TABLE = 'table',
}

export const weeklyReportGeoViewFilterKey: Record<WeeklyReportGeoViewFilter, string> = {
  [WeeklyReportGeoViewFilter.MAP]: 'WeeklyReport.Card.Geography.ViewFilter.Map',
  [WeeklyReportGeoViewFilter.CHART]: 'WeeklyReport.Card.Geography.ViewFilter.Chart',
  [WeeklyReportGeoViewFilter.TABLE]: 'WeeklyReport.Card.Geography.ViewFilter.Table',
}

export const DEFAULT_WEEKLY_REPORT_GEO_VIEW_FILTER = WeeklyReportGeoViewFilter.CHART

export function getWeeklyReportGeoViewFilterOptions(
  defaultOption: WeeklyReportGeoViewFilter,
): OptionsDef<WeeklyReportGeoViewFilter> {
  const opts = <WeeklyReportGeoViewFilter[]>getEnumValues(WeeklyReportGeoViewFilter)
  return opts.map((val) => ({
    key: weeklyReportGeoViewFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
