import { TopLevelGeoUnit } from './details'
import { GdiObject, GdiObjectTimespanContext } from './shared'

export enum GeoLevel {
  CH = 'CH',
  CANTON = 'KTN',
  GREATER_REGION = 'GR',
  GREATER_LABOR_MARKET_REGION = 'GBAE',
  LABOR_MARKET_REGION = 'BAE',
  DISTRICT = 'BZRK',
}

export interface ExtraGeoUnitDataEntryValue {
  normalizedCat: string
  startDate: string
  endDate?: string
}

export type ExtraGeoUnitDataEntry = Record<string, ExtraGeoUnitDataEntryValue>

export type ExtraGeoUnitDataByPeriod = Record<string, ExtraGeoUnitDataEntry>

export interface ExtraGeoUnitsData extends GdiObjectTimespanContext {
  gdiObject: GdiObject.CASE
  geoUnit: TopLevelGeoUnit.CH
  geoLevel: GeoLevel
  values: ExtraGeoUnitDataByPeriod
}
