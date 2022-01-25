import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

// order matters
export enum GeoViewFilter {
  MAP = 'map',
  TABLE = 'table',
}

export const DEFAULT_GEO_VIEW_FILTER = GeoViewFilter.MAP

export const geoViewFilterKey: Record<GeoViewFilter, string> = {
  [GeoViewFilter.MAP]: 'GeoViewFilter.Map',
  [GeoViewFilter.TABLE]: 'GeoViewFilter.Table',
}

export function getGeoViewFilterOptions(defaultOption: GeoViewFilter): OptionsDef<GeoViewFilter> {
  const opts = <GeoViewFilter[]>getEnumValues(GeoViewFilter)
  return opts.map((val) => ({
    key: geoViewFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}
