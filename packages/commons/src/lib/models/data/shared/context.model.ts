import { GeoUnit, IntGeoUnit } from '../details'
import { GdiObject } from './gdi.model'

export interface TimeFrames {
  tfTot: TimeSpan
  tfP2: TimeSpan
  tfP2b: TimeSpan
  tfP3: TimeSpan
  tfP4: TimeSpan
  tfP5: TimeSpan
  tfP6: TimeSpan
  tf28d: TimeSpan
  tf14d: TimeSpan
}

export interface DataVersionContext {
  sourceDate: string
  geoUnit: GeoUnit | IntGeoUnit
}

export interface TimeSpan {
  start: string
  end: string
}

export interface DataTimespanContext extends DataVersionContext {
  timeSpan: TimeSpan
}

export interface GdiObjectContext extends DataVersionContext {
  gdiObject: GdiObject
}

export interface GdiObjectTimespanContext extends GdiObjectContext {
  timeSpan: TimeSpan
}

export interface GdiObjectTimeFrameContext extends GdiObjectContext {
  timeframes: TimeFrames
}
