import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccSymptomsVaccineFilter {
  ALL = 'all',
  MODERNA = 'moderna',
  PFIZER_BIONTECH = 'pfizer_biontech',
  JOHNSON_JOHNSON = 'johnson_johnson',
  UNKNOWN = 'unknown',
}

export const vaccSymptomsVaccineFilterKey: Record<VaccSymptomsVaccineFilter, string> = {
  [VaccSymptomsVaccineFilter.ALL]: 'Vaccination.VaccSymptoms.Card.Development.Filter.All',
  [VaccSymptomsVaccineFilter.MODERNA]: 'Vaccination.VaccSymptoms.Card.Development.Filter.Moderna',
  [VaccSymptomsVaccineFilter.PFIZER_BIONTECH]: 'Vaccination.VaccSymptoms.Card.Development.Filter.PfizerBiontech',
  [VaccSymptomsVaccineFilter.JOHNSON_JOHNSON]: 'Vaccination.VaccSymptoms.Card.Development.Filter.JohnsonJohnson',
  [VaccSymptomsVaccineFilter.UNKNOWN]: 'Vaccination.VaccSymptoms.Card.Development.Filter.Unknown',
}

export const DEFAULT_VACC_SYMPTOMS_VACCINE_FILTER = VaccSymptomsVaccineFilter.ALL

export function getVaccSymptomsVaccineFilterOptions(
  defaultOption: VaccSymptomsVaccineFilter,
): OptionsDef<VaccSymptomsVaccineFilter> {
  const opts = <VaccSymptomsVaccineFilter[]>getEnumValues(VaccSymptomsVaccineFilter)
  return opts.map((val) => ({
    key: vaccSymptomsVaccineFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
