import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum IndicatorFilter {
  HOSP = 'hosp',
  DEATH = 'death',
}

export const indicatorFilterKey: Record<IndicatorFilter, string> = {
  [IndicatorFilter.HOSP]: 'Vaccination.Status.IndicatorFilter.Hosp',
  [IndicatorFilter.DEATH]: 'Vaccination.Status.IndicatorFilter.Death',
}

export const DEFAULT_INDICATOR_FILTER = IndicatorFilter.HOSP

export function indicatorFilterOptions(defaultOption: IndicatorFilter): OptionsDef<IndicatorFilter> {
  const opts = <IndicatorFilter[]>getEnumValues(IndicatorFilter)
  return opts.map((val) => ({
    key: indicatorFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
