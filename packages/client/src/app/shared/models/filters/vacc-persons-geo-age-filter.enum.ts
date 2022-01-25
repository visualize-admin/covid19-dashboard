import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccPersonsGeoAgeFilter {
  ALL = 'all',
  A_5_11 = 'A_5_11',
  A_12_PLUS = 'A_12_PLUS',
  A_12_15 = 'A_12_15',
  A_16_64 = 'A_16_64',
  A_65_PLUS = 'A_65_PLUS',
}

export const DEFAULT_VACC_PERSONS_GEO_AGE_FILTER = VaccPersonsGeoAgeFilter.ALL

export function getVaccPersonsGeoAgeFilterOptions(
  defaultOption: VaccPersonsGeoAgeFilter,
): OptionsDef<VaccPersonsGeoAgeFilter> {
  const opts = <VaccPersonsGeoAgeFilter[]>getEnumValues(VaccPersonsGeoAgeFilter)
  return opts.map((val) => ({
    key: vaccPersonsGeoAgeFilter[val],
    val: val === defaultOption ? null : val,
  }))
}

export const vaccPersonsGeoAgeFilter: Record<VaccPersonsGeoAgeFilter, string> = {
  [VaccPersonsGeoAgeFilter.ALL]: 'Vaccination.VaccPersons.Card.Geography.AgeFilter.ALL',
  [VaccPersonsGeoAgeFilter.A_5_11]: 'Vaccination.VaccPersons.Card.Geography.AgeFilter.A_5_11',
  [VaccPersonsGeoAgeFilter.A_12_PLUS]: 'Vaccination.VaccPersons.Card.Geography.AgeFilter.A_12_PLUS',
  [VaccPersonsGeoAgeFilter.A_12_15]: 'Vaccination.VaccPersons.Card.Geography.AgeFilter.A_12_15',
  [VaccPersonsGeoAgeFilter.A_16_64]: 'Vaccination.VaccPersons.Card.Geography.AgeFilter.A_16_64',
  [VaccPersonsGeoAgeFilter.A_65_PLUS]: 'Vaccination.VaccPersons.Card.Geography.AgeFilter.A_65_PLUS',
}
