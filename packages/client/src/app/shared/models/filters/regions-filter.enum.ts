import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum RegionsFilter {
  CANTONS = 'cantons',
  GREATER_REGIONS = 'greaterRegions',
}

export const DEFAULT_REGIONS_FILTER = RegionsFilter.CANTONS

export const regionsFilterKey: Record<RegionsFilter, string> = {
  [RegionsFilter.GREATER_REGIONS]: 'WeeklyReport.Card.RegionsFilter.GreaterRegions',
  [RegionsFilter.CANTONS]: 'WeeklyReport.Card.RegionsFilter.Cantons',
}

export function getRegionsFilterOptions(defaultOption: RegionsFilter): OptionsDef<RegionsFilter> {
  const opts = <RegionsFilter[]>getEnumValues(RegionsFilter)
  return opts.map((val) => ({
    key: regionsFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
