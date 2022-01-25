import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum HospOccupancyFilter {
  ALL = 'all',
  COVID = 'covid19',
}
export const hospOccupancyFilterKey: Record<HospOccupancyFilter, string> = {
  [HospOccupancyFilter.ALL]: 'HospCapacity.OccupancyFilter.All',
  [HospOccupancyFilter.COVID]: 'HospCapacity.OccupancyFilter.Covid19',
}

export const DEFAULT_HOSP_OCCUPANCY_FILTER = HospOccupancyFilter.ALL

export function getHospOccupancyFilterOptions(defaultOption: HospOccupancyFilter): OptionsDef<HospOccupancyFilter> {
  const opts = <HospOccupancyFilter[]>getEnumValues(HospOccupancyFilter)
  return opts.map((val) => ({
    key: hospOccupancyFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
