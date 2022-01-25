import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum RelAbsFilter {
  ABSOLUTE = 'abs',
  RELATIVE = 'rel',
}

export const relAbsFilterKey: Record<RelAbsFilter, string> = {
  [RelAbsFilter.ABSOLUTE]: 'RelAbsFilter.Absolute',
  [RelAbsFilter.RELATIVE]: 'RelAbsFilter.Relative',
}

export const DEFAULT_REL_ABS_FILTER_HOSP_CAPACITY_DEV: RelAbsFilter = RelAbsFilter.ABSOLUTE

export function getRelAbsFilterOptions(defaultOption: RelAbsFilter): OptionsDef<RelAbsFilter> {
  const opts = <RelAbsFilter[]>getEnumValues(RelAbsFilter)
  return opts.map((val) => ({
    key: relAbsFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
