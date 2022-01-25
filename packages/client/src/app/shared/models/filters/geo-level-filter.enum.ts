import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum GeoLevelFilter {
  CANTONS = 'cantons',
  GREATER_REGIONS = 'greaterRegions',
  AMGR = 'amgr',
  AMRE = 'amre',
  DISTRICTS = 'districts',
}

export const DEFAULT_GEO_LEVEL_FILTER = GeoLevelFilter.CANTONS

export function getGeoLevelFilterOptions(defaultOption: GeoLevelFilter): OptionsDef<GeoLevelFilter> {
  const opts = <GeoLevelFilter[]>getEnumValues(GeoLevelFilter)
  return opts.map((val) => ({
    key: geoLevelFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}

export const geoLevelFilterKey: Record<GeoLevelFilter, string> = {
  [GeoLevelFilter.CANTONS]: 'DetailCardGeoRegions.GeoLevelFilter.Cantons',
  [GeoLevelFilter.GREATER_REGIONS]: 'DetailCardGeoRegions.GeoLevelFilter.GreaterRegions',
  [GeoLevelFilter.AMGR]: 'DetailCardGeoRegions.GeoLevelFilter.Amgr',
  [GeoLevelFilter.AMRE]: 'DetailCardGeoRegions.GeoLevelFilter.Amre',
  [GeoLevelFilter.DISTRICTS]: 'DetailCardGeoRegions.GeoLevelFilter.Districts',
}
