import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccinationRelativityFilter {
  // the order matters (UI)
  INZ_100 = 'inz100',
  ABSOLUTE = 'abs',
}

export const vaccDosesRelativityFilterKey: Record<VaccinationRelativityFilter, string> = {
  [VaccinationRelativityFilter.INZ_100]: 'Vaccination.RelativityFilter.Inz100',
  [VaccinationRelativityFilter.ABSOLUTE]: 'Vaccination.RelativityFilter.Absolute',
}

export const DEFAULT_VACCINATION_RELATIVITY_FILTER = VaccinationRelativityFilter.INZ_100

export function getVaccinationRelativityFilterOptions(
  defaultOption: VaccinationRelativityFilter,
): OptionsDef<VaccinationRelativityFilter> {
  const opts = <VaccinationRelativityFilter[]>getEnumValues(VaccinationRelativityFilter)
  return opts.map((val) => ({
    key: vaccDosesRelativityFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
