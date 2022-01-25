import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

// order matters
export enum DevelopmentViewTotalFilter {
  LINES = 'lines',
  AREAS = 'areas',
}

export const DEFAULT_DEVELOPMENT_VIEW_TOTAL_FILTER = DevelopmentViewTotalFilter.LINES

export const developmentViewTotalFilterKey: Record<DevelopmentViewTotalFilter, string> = {
  [DevelopmentViewTotalFilter.LINES]: 'DevelopmentViewFilter.Lines',
  [DevelopmentViewTotalFilter.AREAS]: 'DevelopmentViewFilter.Areas',
}

export function getDevelopmentViewTotalFilterOptions(
  defaultOption: DevelopmentViewTotalFilter,
): OptionsDef<DevelopmentViewTotalFilter> {
  const opts = <DevelopmentViewTotalFilter[]>getEnumValues(DevelopmentViewTotalFilter)
  return opts.map((val) => ({
    key: developmentViewTotalFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
