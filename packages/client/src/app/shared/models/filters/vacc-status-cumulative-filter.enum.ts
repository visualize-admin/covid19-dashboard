import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccStatusCumulativeFilter {
  DAILY = 'daily',
  TOTAL = 'total',
}

export const vaccStatusCumulativeFilterKey: Record<VaccStatusCumulativeFilter, string> = {
  [VaccStatusCumulativeFilter.DAILY]: 'Vaccination.CumulativeFilter.Development.Daily',
  [VaccStatusCumulativeFilter.TOTAL]: 'Vaccination.CumulativeFilter.Development.Total',
}

export const DEFAULT_VACC_SATUS_CUMULATIVE_FILTER = VaccStatusCumulativeFilter.DAILY

export function vaccStatusCumulativeFilterOptions(
  defaultOption: VaccStatusCumulativeFilter,
): OptionsDef<VaccStatusCumulativeFilter> {
  const opts = <VaccStatusCumulativeFilter[]>getEnumValues(VaccStatusCumulativeFilter)
  return opts.map((val) => ({
    key: vaccStatusCumulativeFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
