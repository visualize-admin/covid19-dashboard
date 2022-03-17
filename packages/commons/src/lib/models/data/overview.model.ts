import { CovidCertificatesOverviewCard } from './covid-certificates-data.model'
import { CovidCtOverviewCardV3 } from './covid-ct.model'
import { AgeRangeByVaccinationStrategy } from './details'

import {
  EpidemiologicVaccDosesDevelopmentEntry,
  EpidemiologicVaccPersonsDevelopmentEntry,
} from './epidemiologic-data.model'
import { HospCapacityOverviewCardV3 } from './hosp-capacity-data.model'
import { OverviewCardV3 } from './overview-card.model'
import { CovidReOverviewCardV3 } from './re-data.model'
import { DataVersionContext, GdiObject, GdiSubset, GdiVariant, InlineValues, TimelineValues } from './shared'
import { CovidVirusVariantsOverviewCardV4 } from './virus-variants-data.model'

export type MinimalOverviewTimelineDataValues = GdiVariant.VALUE | GdiVariant.ROLLMEAN_7D

export type OverviewTimelineDataValues =
  | MinimalOverviewTimelineDataValues
  | GdiVariant.VALUE_PREVIOUS
  | GdiVariant.VALUE_NEWLY_REPORTED

export type OverviewTimelineDataValuesTest =
  | MinimalOverviewTimelineDataValues
  | GdiVariant.VALUE_PCR
  | GdiVariant.VALUE_ANTIGEN

export type EpidemiologicOverviewTimelineData = TimelineValues<OverviewTimelineDataValues>
export type EpidemiologicOverviewTimelineDataTest = TimelineValues<OverviewTimelineDataValuesTest>

export type EpidemiologicOverviewDailyValues =
  | GdiVariant.DELTA_DAY
  | GdiVariant.TOTAL
  | GdiVariant.INZ_TOTAL
  | GdiVariant.SUMP2
  | GdiVariant.INZ_P2
  | GdiVariant.SUMP2B
  | GdiVariant.INZ_P2B
  | GdiVariant.SUMP3
  | GdiVariant.INZ_P3
  | GdiVariant.SUMP4
  | GdiVariant.INZ_P4
  | GdiVariant.SUMP5
  | GdiVariant.INZ_P5
  | GdiVariant.SUMP6
  | GdiVariant.INZ_P6
  | GdiVariant.SUM28D
  | GdiVariant.INZ_28D
  | GdiVariant.SUM14D
  | GdiVariant.INZ_14D
  | GdiVariant.INZ_ROLLSUM_14D

export type EpidemiologicTestOverviewDailyValues =
  | EpidemiologicOverviewDailyValues
  | GdiVariant.PRCT_TOTAL_POSTEST
  | GdiVariant.PRCT_P2_POSTEST
  | GdiVariant.PRCT_P2B_POSTEST
  | GdiVariant.PRCT_P3_POSTEST
  | GdiVariant.PRCT_P4_POSTEST
  | GdiVariant.PRCT_P5_POSTEST
  | GdiVariant.PRCT_P6_POSTEST
  | GdiVariant.PRCT_28D_POSTEST
  | GdiVariant.PRCT_14D_POSTEST

export type CovidVaccinationOverviewDailyValues = {
  [GdiSubset.VACC_DOSES_DELIV]: InlineValues<CovidVaccinationOverviewValues> & { sourceDate: string }
  [GdiSubset.VACC_DOSES_ADMIN]: InlineValues<CovidVaccinationOverviewValues> & { sourceDate: string }
  [GdiSubset.VACC_DOSES_RECEIVED]: InlineValues<CovidVaccinationOverviewValues> & { sourceDate: string }
  [GdiSubset.VACC_PERSONS_FULL]: InlineValues<CovidVaccinationOverviewValues> & { sourceDate: string }
  [GdiSubset.VACC_PERSONS_FIRST_BOOSTER]: InlineValues<CovidVaccinationOverviewValues> & { sourceDate: string }
  [GdiSubset.VACC_PERSONS_PARTIAL]: InlineValues<CovidVaccinationOverviewValues> & { sourceDate: string }
  [GdiSubset.VACC_PERSONS_MIN_ONE_DOSE]: InlineValues<CovidVaccinationOverviewValues> & { sourceDate: string }
}

export type CovidVaccPersonsOverviewWeeklyValues = {
  date: string
  sourceDate: string
  [GdiSubset.VACC_PERSONS_FULL]: InlineValues<CovidVaccinationOverviewValues>
  [GdiSubset.VACC_PERSONS_FIRST_BOOSTER]: InlineValues<CovidVaccinationOverviewValues>
  [GdiSubset.VACC_PERSONS_PARTIAL]: InlineValues<CovidVaccinationOverviewValues>
  [GdiSubset.VACC_PERSONS_MIN_ONE_DOSE]: InlineValues<CovidVaccinationOverviewValues>
}

export type CovidVaccinationOverviewValues = GdiVariant.TOTAL | GdiVariant.INZ_TOTAL

export type EpidemiologicVaccOverviewDevelopmentEntry = EpidemiologicVaccDosesDevelopmentEntry &
  EpidemiologicVaccPersonsDevelopmentEntry

export interface CovidVaccinationOverviewCardV3
  extends OverviewCardV3<CovidVaccinationOverviewDailyValues, EpidemiologicVaccOverviewDevelopmentEntry> {
  dailyValues12Plus: CovidVaccinationOverviewDailyValues
  weeklyVaccPersonsValues: Record<AgeRangeByVaccinationStrategy, CovidVaccPersonsOverviewWeeklyValues>
  gdiObject: GdiObject.VACCINATION
}

export interface DailyReportData extends DataVersionContext {
  optionalText: {
    de: string | null
    fr: string | null
    it: string | null
    rm: string | null
    en: string | null
  }
}

export type OverviewDataObjectKeys = keyof OverviewDataV4

export interface EpidemiologicOverviewCardV3
  extends OverviewCardV3<
    InlineValues<EpidemiologicOverviewDailyValues> & { dateInzRollsum14d: string },
    EpidemiologicOverviewTimelineData,
    number | null
  > {
  gdiObject: GdiObject.CASE | GdiObject.HOSP | GdiObject.DEATH
  deltaDayMode: 'full' | 'recent'
}

export type EpidemiologicTestOverviewDailyValuesWrapper = {
  [GdiSubset.TEST_ALL]: InlineValues<EpidemiologicTestOverviewDailyValues>
  [GdiSubset.TEST_PCR]: InlineValues<EpidemiologicTestOverviewDailyValues>
  [GdiSubset.TEST_ANTIGEN]: InlineValues<EpidemiologicTestOverviewDailyValues>
}

export type EpidemiologicOverviewTestTimelineEntry = { date: string } & {
  [GdiSubset.TEST_ALL]: InlineValues<MinimalOverviewTimelineDataValues>
  [GdiSubset.TEST_PCR]: InlineValues<GdiVariant.VALUE>
  [GdiSubset.TEST_ANTIGEN]: InlineValues<GdiVariant.VALUE>
}

export interface EpidemiologicTestOverviewCardV3
  extends OverviewCardV3<
    EpidemiologicTestOverviewDailyValuesWrapper,
    EpidemiologicOverviewTestTimelineEntry,
    number | null
  > {
  gdiObject: GdiObject.TEST
  deltaDayMode: 'full' | 'recent'
}

export interface OverviewDataV4 {
  covidCase: EpidemiologicOverviewCardV3
  covidHosp: EpidemiologicOverviewCardV3
  covidDeath: EpidemiologicOverviewCardV3
  covidTest: EpidemiologicTestOverviewCardV3
  covidCt: CovidCtOverviewCardV3
  covidRe: CovidReOverviewCardV3
  covidVacc: CovidVaccinationOverviewCardV3
  covidVirusVariants: CovidVirusVariantsOverviewCardV4
  hospCapacity: HospCapacityOverviewCardV3
  dailyReport: DailyReportData
  covidCertificates: CovidCertificatesOverviewCard
}
