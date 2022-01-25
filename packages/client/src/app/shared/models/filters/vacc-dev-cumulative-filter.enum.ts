import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccDevCumulativeFilter {
  TOTAL = 'total',
  DAILY = 'daily',
}

export const vaccDevCumulativeFilterKey: Record<VaccDevCumulativeFilter, string> = {
  [VaccDevCumulativeFilter.TOTAL]: 'Vaccination.CumulativeFilter.Development.Total',
  [VaccDevCumulativeFilter.DAILY]: 'Vaccination.CumulativeFilter.Development.Daily',
}

export const DEFAULT_VACC_DEV_CUMULATIVE_FILTER = VaccDevCumulativeFilter.TOTAL

export function vaccDevCumulativeFilterOptions(
  defaultOption: VaccDevCumulativeFilter,
): OptionsDef<VaccDevCumulativeFilter> {
  const opts = <VaccDevCumulativeFilter[]>getEnumValues(VaccDevCumulativeFilter)
  return opts.map((val) => ({
    key: vaccDevCumulativeFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
