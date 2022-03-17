import { HospCapacityValues } from '../hosp-capacity-data.model'
import { GdiObjectTimespanContext, GdiSubset, GdiVariant, InlineValues, TimelineValues } from '../shared'
import { AgeRange, AgeRangeByVaccinationStrategy, HospCapacityType, Sex } from './demography.model'
import { CantonGeoUnit } from './geography.model'

export type CantonData<DAILY_VALUES extends string> = {
  [key in CantonGeoUnit]: InlineValues<DAILY_VALUES> | null
}

export type DetailTimelineValues =
  | DefaultHistogramDataValuesTotal
  | DefaultHistogramDataValuesP2
  | DefaultHistogramDataValuesP2b
  | DefaultHistogramDataValuesP3
  | DefaultHistogramDataValuesP4
  | DefaultHistogramDataValuesP5
  | DefaultHistogramDataValuesP6
  | DefaultHistogramDataValues28d
  | DefaultHistogramDataValues14d
  | HistogramDataValuesTestTotal
  | HistogramDataValuesTestP2
  | HistogramDataValuesTestP2b
  | HistogramDataValuesTestP3
  | HistogramDataValuesTestP4
  | HistogramDataValuesTestP5
  | HistogramDataValuesTestP6
  | HistogramDataValuesTest28d
  | HistogramDataValuesTest14d
  | HospCapacityValues

export type DefaultHistogramDataValues =
  | GdiVariant.VALUE
  | GdiVariant.INZ
  | GdiVariant.ROLLSUM_14D
  | GdiVariant.INZ_ROLLSUM_14D
  | GdiVariant.INZ_ROLLSUM_14D_CHFL
  | GdiVariant.ROLLMEAN_7D
  | GdiVariant.INZ_ROLLMEAN_7D
  | GdiVariant.INZ_ROLLMEAN_7D_CHFL
  | GdiVariant.VALUE_PREVIOUS
  | GdiVariant.VALUE_NEWLY_REPORTED

export type HistogramDataValuesTest =
  | GdiVariant.PRCT_POSTEST
  | GdiVariant.PRCT_POSTEST_PCR
  | GdiVariant.PRCT_POSTEST_ANTIGEN
  | GdiVariant.VALUE_PCR
  | GdiVariant.VALUE_ANTIGEN
  | GdiVariant.INZ_PCR
  | GdiVariant.INZ_ANTIGEN
  | DefaultHistogramDataValues

export type DefaultHistogramDataValuesTotal = DefaultHistogramDataValues | GdiVariant.TOTAL | GdiVariant.INZ_TOTAL
export type DefaultHistogramDataValuesP2 = DefaultHistogramDataValues | GdiVariant.SUMP2 | GdiVariant.INZ_P2
export type DefaultHistogramDataValuesP2b = DefaultHistogramDataValues | GdiVariant.SUMP2B | GdiVariant.INZ_P2B
export type DefaultHistogramDataValues28d = DefaultHistogramDataValues | GdiVariant.SUM28D | GdiVariant.INZ_28D
export type DefaultHistogramDataValuesP3 = DefaultHistogramDataValues | GdiVariant.SUMP3 | GdiVariant.INZ_P3
export type DefaultHistogramDataValuesP4 = DefaultHistogramDataValues | GdiVariant.SUMP4 | GdiVariant.INZ_P4
export type DefaultHistogramDataValuesP5 = DefaultHistogramDataValues | GdiVariant.SUMP5 | GdiVariant.INZ_P5
export type DefaultHistogramDataValuesP6 = DefaultHistogramDataValues | GdiVariant.SUMP6 | GdiVariant.INZ_P6
export type DefaultHistogramDataValues14d = DefaultHistogramDataValues | GdiVariant.SUM14D | GdiVariant.INZ_14D

export type HistogramDataValuesTestTotal =
  | HistogramDataValuesTest
  | GdiVariant.TOTAL
  | GdiVariant.INZ_TOTAL
  | GdiVariant.TOTAL_PCR
  | GdiVariant.INZ_TOTAL_PCR
  | GdiVariant.TOTAL_ANTIGEN
  | GdiVariant.INZ_TOTAL_ANTIGEN
export type HistogramDataValuesTestP2 =
  | HistogramDataValuesTest
  | GdiVariant.SUMP2
  | GdiVariant.INZ_P2
  | GdiVariant.SUMP2_PCR
  | GdiVariant.INZ_P2_PCR
  | GdiVariant.SUMP2_ANTIGEN
  | GdiVariant.INZ_P2_ANTIGEN
export type HistogramDataValuesTestP2b =
  | HistogramDataValuesTest
  | GdiVariant.SUMP2B
  | GdiVariant.INZ_P2B
  | GdiVariant.SUMP2B_PCR
  | GdiVariant.INZ_P2B_PCR
  | GdiVariant.SUMP2B_ANTIGEN
  | GdiVariant.INZ_P2B_ANTIGEN
export type HistogramDataValuesTestP3 =
  | HistogramDataValuesTest
  | GdiVariant.SUMP3
  | GdiVariant.INZ_P3
  | GdiVariant.SUMP3_PCR
  | GdiVariant.INZ_P3_PCR
  | GdiVariant.SUMP3_ANTIGEN
  | GdiVariant.INZ_P3_ANTIGEN
export type HistogramDataValuesTestP4 =
  | HistogramDataValuesTest
  | GdiVariant.SUMP4
  | GdiVariant.INZ_P4
  | GdiVariant.SUMP4_PCR
  | GdiVariant.INZ_P4_PCR
  | GdiVariant.SUMP4_ANTIGEN
  | GdiVariant.INZ_P4_ANTIGEN
export type HistogramDataValuesTestP5 =
  | HistogramDataValuesTest
  | GdiVariant.SUMP5
  | GdiVariant.INZ_P5
  | GdiVariant.SUMP5_PCR
  | GdiVariant.INZ_P5_PCR
  | GdiVariant.SUMP5_ANTIGEN
  | GdiVariant.INZ_P5_ANTIGEN
export type HistogramDataValuesTestP6 =
  | HistogramDataValuesTest
  | GdiVariant.SUMP6
  | GdiVariant.INZ_P6
  | GdiVariant.SUMP6_PCR
  | GdiVariant.INZ_P6_PCR
  | GdiVariant.SUMP6_ANTIGEN
  | GdiVariant.INZ_P6_ANTIGEN
export type HistogramDataValuesTest28d =
  | HistogramDataValuesTest
  | GdiVariant.SUM28D
  | GdiVariant.INZ_28D
  | GdiVariant.SUM28D_PCR
  | GdiVariant.INZ_28D_PCR
  | GdiVariant.SUM28D_ANTIGEN
  | GdiVariant.INZ_28D_ANTIGEN
export type HistogramDataValuesTest14d =
  | HistogramDataValuesTest
  | GdiVariant.SUM14D
  | GdiVariant.INZ_14D
  | GdiVariant.SUM14D_PCR
  | GdiVariant.INZ_14D_PCR
  | GdiVariant.SUM14D_ANTIGEN
  | GdiVariant.INZ_14D_ANTIGEN

export interface HistogramDetailCard<X extends string> extends GdiObjectTimespanContext {
  timeLine: TimelineValues<X>[]
}

export interface HospCapacityHistogramDetailCard<X extends DetailTimelineValues> extends GdiObjectTimespanContext {
  timeLineAbsolute: TimelineValues<X>[]
  timeLineRelative: TimelineValues<X>[]
}

export interface BucketData<T, X extends AgeRange | Sex | AgeRangeByVaccinationStrategy | 'all'> {
  isoWeek: string
  start: string
  end: string
  buckets: BucketEntry<X, T>[]
}

export type VaccinationAgeRangeValues = GdiVariant.WEEK | GdiVariant.INZ_WEEK | GdiVariant.TOTAL | GdiVariant.INZ_TOTAL
export type HospReasonsAgeRangeValues =
  | GdiVariant.WEEK
  | GdiVariant.INZ_WEEK
  | GdiVariant.TOTAL
  | GdiVariant.INZ_TOTAL
  | GdiVariant.PERCENTAGE
  | GdiVariant.PERCENTAGE_TOTAL
export type GenderValues = GdiVariant.PERCENTAGE | GdiVariant.INZ_WEEK
export type AgeRangeValues = GdiVariant.WEEK | GdiVariant.INZ_WEEK

// age
export interface AgeBucketData extends BucketData<DefaultBucketValue<AgeRangeValues>, AgeRange> {}

export interface VaccinationAgeBucketData extends BucketData<DefaultBucketValue<VaccinationAgeRangeValues>, AgeRange> {}

export interface VaccinationPersonsAgeBucketData
  extends BucketData<DefaultBucketValue<VaccinationAgeRangeValues>, VaccPersonsAgeRanges> {}

export type VaccPersonsAgeRanges = AgeRange | AgeRangeByVaccinationStrategy

export interface VaccinationAgeBucketDataVaccPersons
  extends BucketData<VaccPersonsBucketValue<VaccinationAgeRangeValues>, VaccPersonsAgeRanges> {
  incompleteWeek: boolean
}

export type HospReasonsAgeRanges = AgeRange | 'all'

export interface HospReasonsAgeBucketData
  extends BucketData<HospReasonsBucketValue<HospReasonsAgeRangeValues>, HospReasonsAgeRanges> {}

// gender
export interface GenderBucketData extends BucketData<DefaultBucketValue<GenderValues>, Sex> {}

export interface VaccinationGenderBucketDataVaccPersons extends BucketData<VaccPersonsBucketValue<GenderValues>, Sex> {}

export type DefaultBucketValue<T extends string> = Record<T, number | null>
export type VaccPersonsBucketValue<T extends string> = {
  [GdiSubset.VACC_PERSONS_FULL]: DefaultBucketValue<T>
  [GdiSubset.VACC_PERSONS_FIRST_BOOSTER]: DefaultBucketValue<T>
  [GdiSubset.VACC_PERSONS_MIN_ONE_DOSE]: DefaultBucketValue<T>
  [GdiSubset.VACC_PERSONS_PARTIAL]: DefaultBucketValue<T>
}
export type HospReasonsBucketValue<T extends string> = {
  [GdiSubset.HOSP_REASON_COVID]: DefaultBucketValue<T>
  [GdiSubset.HOSP_REASON_OTHER]: DefaultBucketValue<T>
  [GdiSubset.HOSP_REASON_UNKNOWN]: DefaultBucketValue<T>
}

export type BucketEntry<X extends 'all' | AgeRange | Sex | AgeRangeByVaccinationStrategy | HospCapacityType, T> = T & {
  bucket: X
}
