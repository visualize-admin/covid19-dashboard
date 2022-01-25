import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccPersonsDevCumulativeFilter {
  TOTAL = 'total',
  MEAN = 'mean',
  DAILY = 'daily',
}

export const vaccPersonsDevCumulativeFilterKey: Record<VaccPersonsDevCumulativeFilter, string> = {
  [VaccPersonsDevCumulativeFilter.TOTAL]: 'Vaccination.CumulativeFilter.Development.Total',
  [VaccPersonsDevCumulativeFilter.MEAN]: 'Vaccination.CumulativeFilter.Development.Mean',
  [VaccPersonsDevCumulativeFilter.DAILY]: 'Vaccination.CumulativeFilter.Development.Daily',
}

export const DEFAULT_VACC_PERSONS_DEV_CUMULATIVE_FILTER = VaccPersonsDevCumulativeFilter.TOTAL

export function vaccPersonsDevCumulativeFilterOptions(
  defaultOption: VaccPersonsDevCumulativeFilter,
): OptionsDef<VaccPersonsDevCumulativeFilter> {
  const opts = <VaccPersonsDevCumulativeFilter[]>getEnumValues(VaccPersonsDevCumulativeFilter)
  return opts.map((val) => ({
    key: vaccPersonsDevCumulativeFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
