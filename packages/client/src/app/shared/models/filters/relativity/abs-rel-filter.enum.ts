import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../../option-def.type'

export enum AbsRelFilter {
  // the order matters (UI)
  ABSOLUTE = 'abs',
  RELATIVE = 'rel',
}

const absRelFilterKey: Record<AbsRelFilter, string> = {
  [AbsRelFilter.ABSOLUTE]: 'RelativityFilter.Absolute',
  [AbsRelFilter.RELATIVE]: 'RelativityFilter.Relative',
}

export const DEFAULT_REL_ABS_FILTER_HOSP_CAPACITY_DEV: AbsRelFilter = AbsRelFilter.ABSOLUTE

export function getAbsRelFilterOptions(defaultOption: AbsRelFilter): OptionsDef<AbsRelFilter> {
  const opts = <AbsRelFilter[]>getEnumValues(AbsRelFilter)
  return opts.map((val) => ({
    key: absRelFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
