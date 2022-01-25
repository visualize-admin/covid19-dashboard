import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

// order matters
export enum DevelopmentViewFilter {
  LINES = 'lines',
  BARS = 'bars',
}

export const DEFAULT_DEVELOPMENT_VIEW_FILTER = DevelopmentViewFilter.LINES

export const developmentViewFilterKey: Record<DevelopmentViewFilter, string> = {
  [DevelopmentViewFilter.LINES]: 'DevelopmentViewFilter.Lines',
  [DevelopmentViewFilter.BARS]: 'DevelopmentViewFilter.Bars',
}

export function getDevelopmentViewFilterOptions(
  defaultOption: DevelopmentViewFilter,
): OptionsDef<DevelopmentViewFilter> {
  const opts = <DevelopmentViewFilter[]>getEnumValues(DevelopmentViewFilter)
  return opts.map((val) => ({
    key: developmentViewFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
