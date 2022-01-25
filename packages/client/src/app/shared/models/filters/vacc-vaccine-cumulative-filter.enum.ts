import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccVaccineCumulativeFilter {
  TOTAL = 'total',
  DAILY = 'daily',
}

export const vaccVaccineCumulativeFilterKey: Record<VaccVaccineCumulativeFilter, string> = {
  [VaccVaccineCumulativeFilter.TOTAL]: 'Vaccination.CumulativeFilter.Vaccine.Total',
  [VaccVaccineCumulativeFilter.DAILY]: 'Vaccination.CumulativeFilter.Vaccine.Daily',
}

export const DEFAULT_VACC_VACCINE_CUMULATIVE_FILTER = VaccVaccineCumulativeFilter.TOTAL

export function getVaccVaccineCumulativeFilterOptions(
  defaultOption: VaccVaccineCumulativeFilter,
): OptionsDef<VaccVaccineCumulativeFilter> {
  const opts = <VaccVaccineCumulativeFilter[]>getEnumValues(VaccVaccineCumulativeFilter)
  return opts.map((val) => ({
    key: vaccVaccineCumulativeFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
