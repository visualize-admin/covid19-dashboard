import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum HospCausePersonAgeFilter {
  ALL = 'all',
  A_0_9 = '0-9',
  A_10_19 = '10-19',
  A_20_29 = '20-29',
  A_30_39 = '30-39',
  A_40_49 = '40-49',
  A_50_59 = '50-59',
  A_60_69 = '60-69',
  A_70_79 = '70-79',
  A_80_PLUS = '80+',
}

export const DEFAULT_HOSP_CAUSE_PERSONS_AGE_FILTER = HospCausePersonAgeFilter.ALL

const personsGeoAgeFilter: Record<HospCausePersonAgeFilter, string> = {
  [HospCausePersonAgeFilter.ALL]: 'AgeFilter.ALL',
  [HospCausePersonAgeFilter.A_0_9]: 'AgeFilter.A_00_09',
  [HospCausePersonAgeFilter.A_10_19]: 'AgeFilter.A_10_19',
  [HospCausePersonAgeFilter.A_20_29]: 'AgeFilter.A_20_29',
  [HospCausePersonAgeFilter.A_30_39]: 'AgeFilter.A_30_39',
  [HospCausePersonAgeFilter.A_40_49]: 'AgeFilter.A_40_49',
  [HospCausePersonAgeFilter.A_50_59]: 'AgeFilter.A_50_59',
  [HospCausePersonAgeFilter.A_60_69]: 'AgeFilter.A_60_69',
  [HospCausePersonAgeFilter.A_70_79]: 'AgeFilter.A_70_79',
  [HospCausePersonAgeFilter.A_80_PLUS]: 'AgeFilter.A_80_PLUS',
}

export function getHospCausePersonAgeFilterOptions(
  defaultOption: HospCausePersonAgeFilter,
): OptionsDef<HospCausePersonAgeFilter> {
  const opts = <HospCausePersonAgeFilter[]>getEnumValues(HospCausePersonAgeFilter)
  return opts.map((val) => ({
    key: personsGeoAgeFilter[val],
    val: val === defaultOption ? null : val,
  }))
}
