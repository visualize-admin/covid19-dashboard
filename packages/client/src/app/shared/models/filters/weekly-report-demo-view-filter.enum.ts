import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

// order matters for ui
export enum WeeklyReportDemoViewFilter {
  CHART = 'chart',
  TABLE = 'table',
}

export const weeklyReportDemoViewFilterKey: Record<WeeklyReportDemoViewFilter, string> = {
  [WeeklyReportDemoViewFilter.CHART]: 'WeeklyReport.Card.Demography.ViewFilter.Chart',
  [WeeklyReportDemoViewFilter.TABLE]: 'WeeklyReport.Card.Demography.ViewFilter.Table',
}

export const DEFAULT_WEEKLY_REPORT_DEMO_VIEW_FILTER = WeeklyReportDemoViewFilter.CHART

export function getWeeklyDemoViewFilterOptions(
  defaultOption: WeeklyReportDemoViewFilter,
): OptionsDef<WeeklyReportDemoViewFilter> {
  const opts = <WeeklyReportDemoViewFilter[]>getEnumValues(WeeklyReportDemoViewFilter)
  return opts.map((val) => ({
    key: weeklyReportDemoViewFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
