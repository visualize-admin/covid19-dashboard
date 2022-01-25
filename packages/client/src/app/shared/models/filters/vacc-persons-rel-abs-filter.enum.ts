import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccPersonsRelAbsFilter {
  RELATIVE = 'rel',
  ABSOLUTE = 'abs',
}

export const vaccPersonsRelAbsFilterKey: Record<VaccPersonsRelAbsFilter, string> = {
  [VaccPersonsRelAbsFilter.ABSOLUTE]: 'RelAbsFilter.Absolute',
  [VaccPersonsRelAbsFilter.RELATIVE]: 'RelAbsFilter.Relative',
}

export const DEFAULT_VACC_PERSONS_REL_ABS_FILTER: VaccPersonsRelAbsFilter = VaccPersonsRelAbsFilter.RELATIVE

export function getVaccPersonsRelAbsFilterOptions(
  defaultOption: VaccPersonsRelAbsFilter,
): OptionsDef<VaccPersonsRelAbsFilter> {
  const opts = <VaccPersonsRelAbsFilter[]>getEnumValues(VaccPersonsRelAbsFilter)
  return opts.map((val) => ({
    key: vaccPersonsRelAbsFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
