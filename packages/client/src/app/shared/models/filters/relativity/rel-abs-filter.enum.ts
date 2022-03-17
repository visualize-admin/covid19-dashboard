import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../../option-def.type'

export enum RelAbsFilter {
  RELATIVE = 'rel',
  ABSOLUTE = 'abs',
}

const relAbsFilterKey: Record<RelAbsFilter, string> = {
  [RelAbsFilter.RELATIVE]: 'RelativityFilter.Relative',
  [RelAbsFilter.ABSOLUTE]: 'RelativityFilter.Absolute',
}

export const DEFAULT_VACC_PERSONS_REL_ABS_FILTER: RelAbsFilter = RelAbsFilter.RELATIVE

export function getRelAbsFilterOptions(defaultOption: RelAbsFilter): OptionsDef<RelAbsFilter> {
  const opts = <RelAbsFilter[]>getEnumValues(RelAbsFilter)
  return opts.map((val) => ({
    key: relAbsFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
