import { AgeRange, BucketEntry, DefaultBucketValue, GeoUnit, Sex, TopLevelGeoUnit } from './details'
import {
  GdiObject,
  GdiObjectContext,
  GdiObjectTimespanContext,
  GdiSubset,
  GdiVariant,
  InlineValues,
  InlineValuesOpt,
  TimeSpan,
} from './shared'

export interface MultiLanguageText {
  de: string | null
  fr: string | null
  it: string | null
  rm: string | null
  en: string | null
  version: string | null
}

export enum WeeklyReportTextIdentifier {
  SIT_REP_SUMMARY_INTRO = 'overview-short_description',
  SIT_REP_SUMMARY_CASES = 'overview-cases',
  SIT_REP_SUMMARY_HOSP = 'overview-hospitalisations',
  SIT_REP_SUMMARY_DEATH = 'overview-deaths',
  SIT_REP_SUMMARY_TEST = 'overview-tests',
  SIT_REP_SUMMARY_CT = 'overview-contact_tracing',
  CASES_SUMMARY = 'cases-summary',
  CASES_GEOGRAPHY = 'cases-geography',
  CASES_DEMOGRAPHY = 'cases-demography',
  HOSP_SUMMARY = 'hospitalisations-summary',
  HOSP_GEOGRAPHY = 'hospitalisations-geography',
  HOSP_DEMOGRAPHY = 'hospitalisations-demography',
  DEATH_SUMMARY = 'deaths-summary',
  DEATH_GEOGRAPHY = 'deaths-geography',
  DEATH_DEMOGRAPHY = 'deaths-demography',
  TEST_SUMMARY = 'tests-summary',
  TEST_GEOGRAPHY = 'tests-geography',
  TEST_DEMOGRAPHY = 'tests-demography',
  TEST_POST_TEST = 'tests-share_of_positive_tests',
  HOSP_CAPACITY_ICU_SUMMARY = 'hospcapacityicu-summary',
  METHODS_EPI = 'methods-cases_hosps_deaths_tests',
  METHODS_DEADLINE = 'methods-deadline',
  METHODS_CONTACT_TRACING = 'methods-contact_tracing',
  METHODS_HOSP_CAPACITY = 'methods-hospcapacityicu',
  METHODS_TRENDS = 'methods-trends',
}

export interface WeeklyReportBaseSummaryCard extends GdiObjectTimespanContext {
  summary: MultiLanguageText
}

export interface WeeklySituationReportSummaryCard extends WeeklyReportBaseSummaryCard {
  [GdiObject.CASE]: MultiLanguageText
  [GdiObject.HOSP]: MultiLanguageText
  [GdiObject.DEATH]: MultiLanguageText
  [GdiObject.TEST]: MultiLanguageText
  [GdiObject.CT]: MultiLanguageText
}

export interface WeeklyReportMethodsCard extends GdiObjectTimespanContext {
  epidemiologic: MultiLanguageText
  deadline: MultiLanguageText
  contactTracing: MultiLanguageText
  hospCapacity: MultiLanguageText
  trends: MultiLanguageText
}

export type WeeklyReportHospCapacitySummaryCard = WeeklyReportBaseSummaryCard

export interface WeeklyReportHospCapacityDataCard extends GdiObjectTimespanContext {
  // can be extended to Record<GeoUnit, Record<HospCapacityGdiSubsets, InlineValues<HospCapacityWeeklyValues>>> without a breaking change, keeping it simple for now though.
  geoUnitData: {
    [TopLevelGeoUnit.CH]: Record<HospCapacityGdiSubsets, InlineValues<HospCapacityWeeklyValues>>
  }
}

export interface WeeklyReportEpidemiologicSummaryCard extends GdiObjectTimespanContext {
  summary: MultiLanguageText
  geography: MultiLanguageText
  demography: MultiLanguageText
  testPositivity?: MultiLanguageText
}

export type HospCapacityGdiSubsets =
  | GdiSubset.HOSP_CAPACITY_COVID
  | GdiSubset.HOSP_CAPACITY_NONCOVID
  | GdiSubset.HOSP_CAPACITY_FREE

export type HospCapacityWeeklyValues =
  | GdiVariant.WEEK
  | GdiVariant.PERCENTAGE
  | GdiVariant.DIFF_WEEK_PERCENTAGE
  | GdiVariant.DIFF_WEEK_PP_PERCENTAGE

export type WeeklyValues =
  | GdiVariant.TOTAL
  | GdiVariant.INZ_TOTAL
  | GdiVariant.WEEK
  | GdiVariant.INZ_WEEK
  | GdiVariant.DIFF_WEEK_PERCENTAGE

export type WeeklyValuesOPT =
  | GdiVariant.PRCT_WEEK_POSTEST
  | GdiVariant.PRCT_TOTAL_POSTEST
  | GdiVariant.DIFF_PP_PRCT_WEEK_POSTEST

export type WeeklyInlineValues = InlineValues<WeeklyValues> & InlineValuesOpt<WeeklyValuesOPT>

export interface WeeklyOverviewData {
  [GdiObject.CASE]: WeeklyInlineValues
  [GdiObject.HOSP]: WeeklyInlineValues
  [GdiObject.DEATH]: WeeklyInlineValues
  [GdiObject.TEST]: {
    [GdiSubset.TEST_ALL]: WeeklyInlineValues
    [GdiSubset.TEST_PCR]: WeeklyInlineValues
    [GdiSubset.TEST_ANTIGEN]: WeeklyInlineValues
  }
}

export interface WeeklySitutationReportOverviewCard extends GdiObjectTimespanContext {
  chFlData: WeeklyOverviewData
  chData: WeeklyOverviewData
  flData: WeeklyOverviewData
}

export type WeeklyDevelopmentTimelineValues = WeeklyReportWeek & InlineValues<GdiVariant.WEEK>

export type WeeklyDevelopmentTestTimelineValues = WeeklyReportWeek & {
  [GdiSubset.TEST_ALL]: InlineValues<GdiVariant.WEEK>
  [GdiSubset.TEST_PCR]: InlineValues<GdiVariant.WEEK | GdiVariant.PRCT_WEEK_POSTEST>
  [GdiSubset.TEST_ANTIGEN]: InlineValues<GdiVariant.WEEK | GdiVariant.PRCT_WEEK_POSTEST>
}

export interface WeeklySituationReportDevelopmentCard extends GdiObjectContext {
  gdiObject: GdiObject.WEEKLY_SIT_REP
  [GdiObject.CASE]: WeeklyDevelopmentTimelineValues[]
  [GdiObject.HOSP]: WeeklyDevelopmentTimelineValues[]
  [GdiObject.DEATH]: WeeklyDevelopmentTimelineValues[]
  [GdiObject.TEST]: WeeklyDevelopmentTestTimelineValues[]
}

export type WeeklyReportEpidemiologicGeoUnitData = Record<GeoUnit, WeeklyInlineValues>

export interface WeeklyReportEpidemiologicGeographyCard extends GdiObjectTimespanContext {
  geoUnitData: WeeklyReportEpidemiologicGeoUnitData
}

export type WeeklyPositivityRateValues =
  | GdiVariant.PRCT_WEEK_POSTEST
  | GdiVariant.PRCT_TOTAL_POSTEST
  | GdiVariant.DIFF_PP_PRCT_WEEK_POSTEST

export type WeeklyPositivityRateInlineValues = InlineValues<WeeklyPositivityRateValues>

export type WeeklyPositivityRateData = {
  [GdiSubset.TEST_PCR]: WeeklyPositivityRateInlineValues
  [GdiSubset.TEST_ANTIGEN]: WeeklyPositivityRateInlineValues
}

export type WeeklyReportPositivityRateGeoUnitData = Record<GeoUnit, WeeklyPositivityRateData>

export interface WeeklyReportPositivityRateGeographyCard extends GdiObjectTimespanContext {
  geoUnitData: WeeklyReportPositivityRateGeoUnitData
}

export interface WeeklyReportAgeBucketEntry
  extends BucketEntry<
    AgeRange,
    DefaultBucketValue<GdiVariant.WEEK | GdiVariant.INZ_WEEK | GdiVariant.DIFF_WEEK_PERCENTAGE>
  > {}

export interface WeeklyReportGenderBucketEntry
  extends BucketEntry<
    Sex,
    DefaultBucketValue<GdiVariant.PERCENTAGE | GdiVariant.WEEK | GdiVariant.DIFF_PP_PERCENTAGE>
  > {}

export interface WeeklyReportEpidemiologicDemographyCard extends GdiObjectTimespanContext {
  ageData: WeeklyReportAgeBucketEntry[]
  genderData: WeeklyReportGenderBucketEntry[]
}

export interface WeeklyReportWeekList {
  sourceDate: string
  latest: WeeklyReportListItem
  availableWeeks: WeeklyReportListItem[]
}

export interface WeeklyReportListItem {
  current: WeeklyReportWeek
  previous: WeeklyReportWeek
}

export interface WeeklyReportWeek {
  isoWeek: number
  timeSpan: TimeSpan
}
