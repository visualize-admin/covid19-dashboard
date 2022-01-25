import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccPersonsDemoFilter {
  FULL = 'full',
  MIN_ONE = 'minOne',
  BOOSTER = 'booster',
}

export const DEFAULT_VACC_PERSONS_AGE_DEMO_FILTER = VaccPersonsDemoFilter.FULL
export const DEFAULT_VACC_PERSONS_SEX_DEMO_FILTER = VaccPersonsDemoFilter.FULL

export function getVaccPersonsDemoFilterOptions(
  defaultOption: VaccPersonsDemoFilter,
): OptionsDef<VaccPersonsDemoFilter> {
  const opts = <VaccPersonsDemoFilter[]>getEnumValues(VaccPersonsDemoFilter)
  return opts.map((val) => ({
    key: vaccCumulativeFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}

export const vaccCumulativeFilterKey: Record<VaccPersonsDemoFilter, string> = {
  [VaccPersonsDemoFilter.FULL]: 'Vaccination.VaccPersons.Card.Demography.Filter.Full',
  [VaccPersonsDemoFilter.MIN_ONE]: 'Vaccination.VaccPersons.Card.Demography.Filter.MinOne',
  [VaccPersonsDemoFilter.BOOSTER]: 'Vaccination.VaccPersons.Card.Demography.Filter.Booster',
}
