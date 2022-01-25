import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

// order matters for ui
export enum WeeklyReportTestPositivityViewFilter {
  CHART = 'chart',
  TABLE = 'table',
}

export const weeklyReportTestPositivityViewFilterKey: Record<WeeklyReportTestPositivityViewFilter, string> = {
  [WeeklyReportTestPositivityViewFilter.CHART]: 'WeeklyReport.Card.TestPositivity.ViewFilter.Chart',
  [WeeklyReportTestPositivityViewFilter.TABLE]: 'WeeklyReport.Card.TestPositivity.ViewFilter.Table',
}

export const DEFAULT_WEEKLY_REPORT_TEST_POSITIVITY_VIEW_FILTER = WeeklyReportTestPositivityViewFilter.CHART

export function getWeeklyReportTestPositivityViewFilterOptions(
  defaultOption: WeeklyReportTestPositivityViewFilter,
): OptionsDef<WeeklyReportTestPositivityViewFilter> {
  const opts = <WeeklyReportTestPositivityViewFilter[]>getEnumValues(WeeklyReportTestPositivityViewFilter)
  return opts.map((val) => ({
    key: weeklyReportTestPositivityViewFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
