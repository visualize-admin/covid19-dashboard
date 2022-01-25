import { CantonGeoUnit } from './details'
import { OverviewCardV3 } from './overview-card.model'
import {
  GdiObject,
  GdiObjectTimeFrameContext,
  GdiObjectTimespanContext,
  GdiSubset,
  GdiVariant,
  InlineValues,
  TimelineValues,
} from './shared'

export type HospCapacityValues =
  | GdiVariant.VALUE_HOSP_BEDS_CAPACITY
  | GdiVariant.VALUE_HOSP_BEDS_COVID
  | GdiVariant.VALUE_HOSP_BEDS_NONCOVID
  | GdiVariant.VALUE_HOSP_BEDS_FREE
  | GdiVariant.VALUE_HOSP_BEDS_ALL
  | GdiVariant.PERCENTAGE_HOSP_BEDS_COVID
  | GdiVariant.PERCENTAGE_HOSP_BEDS_NONCOVID
  | GdiVariant.PERCENTAGE_HOSP_BEDS_FREE
  | GdiVariant.PERCENTAGE_HOSP_BEDS_ALL
  | GdiVariant.ROLLMEAN_15D_HOSP_BEDS_CAPACITY
  | GdiVariant.ROLLMEAN_15D_HOSP_BEDS_COVID
  | GdiVariant.ROLLMEAN_15D_HOSP_BEDS_NONCOVID
  | GdiVariant.ROLLMEAN_15D_HOSP_BEDS_FREE
  | GdiVariant.ROLLMEAN_15D_HOSP_BEDS_ALL

export type HospCapacityGeoValues =
  | GdiVariant.VALUE_HOSP_BEDS_CAPACITY
  | GdiVariant.VALUE_HOSP_BEDS_COVID
  | GdiVariant.VALUE_HOSP_BEDS_NONCOVID
  | GdiVariant.VALUE_HOSP_BEDS_FREE
  | GdiVariant.VALUE_HOSP_BEDS_ALL
  | GdiVariant.PERCENTAGE_HOSP_BEDS_COVID
  | GdiVariant.PERCENTAGE_HOSP_BEDS_NONCOVID
  | GdiVariant.PERCENTAGE_HOSP_BEDS_FREE
  | GdiVariant.PERCENTAGE_HOSP_BEDS_ALL

export type HospCapacityAbsValues =
  | GdiVariant.VALUE_HOSP_BEDS_CAPACITY
  | GdiVariant.VALUE_HOSP_BEDS_COVID
  | GdiVariant.VALUE_HOSP_BEDS_NONCOVID
  | GdiVariant.VALUE_HOSP_BEDS_FREE
  | GdiVariant.VALUE_HOSP_BEDS_ALL
  | GdiVariant.ROLLMEAN_15D_HOSP_BEDS_CAPACITY
  | GdiVariant.ROLLMEAN_15D_HOSP_BEDS_COVID
  | GdiVariant.ROLLMEAN_15D_HOSP_BEDS_NONCOVID
  | GdiVariant.ROLLMEAN_15D_HOSP_BEDS_FREE
  | GdiVariant.ROLLMEAN_15D_HOSP_BEDS_ALL

export type HospCapacityRelValues =
  | GdiVariant.VALUE_HOSP_BEDS_CAPACITY
  | GdiVariant.VALUE_HOSP_BEDS_COVID
  | GdiVariant.VALUE_HOSP_BEDS_NONCOVID
  | GdiVariant.VALUE_HOSP_BEDS_FREE
  | GdiVariant.VALUE_HOSP_BEDS_ALL
  | GdiVariant.PERCENTAGE_HOSP_BEDS_COVID
  | GdiVariant.PERCENTAGE_HOSP_BEDS_NONCOVID
  | GdiVariant.PERCENTAGE_HOSP_BEDS_FREE
  | GdiVariant.PERCENTAGE_HOSP_BEDS_ALL

export type HospCapacityGdiObjects = GdiObject.HOSP_CAPACITY_ICU | GdiObject.HOSP_CAPACITY_TOTAL

export interface HospCapacityExistsRecord {
  exists: boolean
}

export type HospCapacityDevelopmentAbsRecord = TimelineValues<HospCapacityAbsValues> & HospCapacityExistsRecord
export type HospCapacityDevelopmentRelRecord = TimelineValues<HospCapacityRelValues> & HospCapacityExistsRecord

/** the actual file type for hospcapacity/hospcapacity-development-{gdi}-{geoUnit}.json */
export interface HospCapacityDevelopmentData extends GdiObjectTimeFrameContext {
  /** valueAbs contains the actual reported values */
  valuesAbs: HospCapacityDevelopmentAbsRecord[]
  /** valuesRel contains forward propagated data */
  valuesRel: HospCapacityDevelopmentRelRecord[]
}

export type HospCapacityCertAdhocValues = InlineValues<GdiVariant.VALUE>

export type HospCapacityCertAdhocDevelopmentValue = {
  date: string
  [GdiSubset.HOSP_CAPACITY_ICU_CERT_TARGET]: HospCapacityCertAdhocValues
  [GdiSubset.HOSP_CAPACITY_ICU_CERT_OPERATIONAL]: HospCapacityCertAdhocValues
  [GdiSubset.HOSP_CAPACITY_ICU_ADHOC_OPERATIONAL]: HospCapacityCertAdhocValues
}

/** the actual file type for hospcapacity/hospcapacity-development-{gdi}-{geoUnit}.json */
export interface HospCapacityCertAdhocDevelopmentData extends GdiObjectTimeFrameContext {
  values: HospCapacityCertAdhocDevelopmentValue[]
}

export type HospCapacityGeoValuesRecord = InlineValues<HospCapacityGeoValues> & HospCapacityExistsRecord

export type HospCapacityGeoCantonData = { [key in CantonGeoUnit]: HospCapacityGeoValuesRecord | null }

/** the actual file type for hospcapacity/hospcapacity-geography-{gdi}.json */
export interface HospCapacityGeographyData extends GdiObjectTimespanContext {
  chData: HospCapacityGeoValuesRecord
  cantonData: HospCapacityGeoCantonData
}

export interface HospCapacityOverviewValues {
  [GdiObject.HOSP_CAPACITY_TOTAL]: InlineValues<
    GdiVariant.PERCENTAGE_HOSP_BEDS_ALL | GdiVariant.PERCENTAGE_HOSP_BEDS_COVID
  >
  [GdiObject.HOSP_CAPACITY_ICU]: { date15dMean: string | null } & InlineValues<
    | GdiVariant.PERCENTAGE_HOSP_BEDS_ALL
    | GdiVariant.PERCENTAGE_HOSP_BEDS_COVID
    | GdiVariant.ROLLMEAN_15D_HOSP_BEDS_COVID
  >
}

export interface HospCapacityOverviewCardV3
  extends OverviewCardV3<HospCapacityOverviewValues, TimelineValues<HospCapacityAbsValues>> {
  gdiObject: GdiObject.HOSP_CAPACITY
}
