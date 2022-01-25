import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum VaccCumulativeFilter {
  WEEKLY = 'weekly',
  TOTAL = 'total',
}

export const DEFAULT_VACC_DEMO_CUMULATIVE_FILTER = VaccCumulativeFilter.WEEKLY
export const DEFAULT_VACC_INDICATION_CUMULATIVE_FILTER = VaccCumulativeFilter.WEEKLY
export const DEFAULT_VACC_LOCATION_CUMULATIVE_FILTER = VaccCumulativeFilter.WEEKLY

export function getVaccCumulativeFilterOptions(defaultOption: VaccCumulativeFilter): OptionsDef<VaccCumulativeFilter> {
  const opts = <VaccCumulativeFilter[]>getEnumValues(VaccCumulativeFilter)
  return opts.map((val) => ({
    key: vaccCumulativeFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}

export const vaccCumulativeFilterKey: Record<VaccCumulativeFilter, string> = {
  [VaccCumulativeFilter.WEEKLY]: 'Vaccination.CumulativeFilter.Weekly',
  [VaccCumulativeFilter.TOTAL]: 'Vaccination.CumulativeFilter.Total',
}
