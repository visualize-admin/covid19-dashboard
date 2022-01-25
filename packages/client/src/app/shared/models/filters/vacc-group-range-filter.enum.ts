import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccGroupRangeFilter {
  VACCED_PERSONS = 'vaccinated',
  POPULATION = 'population',
}

const vaccGroupRangeFilterKey: Record<VaccGroupRangeFilter, string> = {
  [VaccGroupRangeFilter.VACCED_PERSONS]: 'Vaccination.VaccPersonsFull.Card.GroupRangeFilter.FullyVaccinatedPersons',
  [VaccGroupRangeFilter.POPULATION]: 'Vaccination.VaccPersonsFull.Card.GroupRangeFilter.Population',
}

/**
 * the default option for {@linkVaccGroupRangeFilter }
 * if this value will ever change,
 * {@link DetailCardVaccinationGroupRatioComponent#ngOnInit} Control reset behaviour needs to be changed
 */
export const DEFAULT_VACC_GROUP_RANGE_FILTER = VaccGroupRangeFilter.VACCED_PERSONS

export function getVaccGroupRangeFilterOptions(defaultOption: VaccGroupRangeFilter): OptionsDef<VaccGroupRangeFilter> {
  const opts = <VaccGroupRangeFilter[]>getEnumValues(VaccGroupRangeFilter)
  return opts.map((val) => ({
    key: vaccGroupRangeFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
