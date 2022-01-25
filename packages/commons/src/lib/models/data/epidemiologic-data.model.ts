import {
  AgeBucketData,
  AgeRangeByVaccinationStrategy,
  CantonData,
  CantonGeoUnit,
  GenderBucketData,
  VaccinationAgeBucketData,
  VaccinationAgeBucketDataVaccPersons,
  VaccinationGenderBucketDataVaccPersons,
} from './details'
import {
  GdiObject,
  GdiObjectContext,
  GdiObjectTimeFrameContext,
  GdiObjectTimespanContext,
  GdiSubset,
  GdiVariant,
  InlineValues,
  InlineValuesOpt,
  TimeSpan,
} from './shared'

export type EpidemiologicGdiObject = GdiObject.CASE | GdiObject.HOSP | GdiObject.DEATH | GdiObject.TEST
export type VaccinationGdiObject =
  | GdiObject.VACC_DOSES
  | GdiObject.VACC_PERSONS
  | GdiObject.VACC_SYMPTOMS
  | GdiObject.VACC_BREAKTHROUGH
  | GdiObject.EPI_VACC_STATUS

export enum EpidemiologicSimpleGdi {
  CASE = 'case',
  HOSP = 'hosp',
  DEATH = 'death',
  TEST = 'test',
  VIRUS_VARIANTS = 'virus-variants',
  REPRO = 'repro',
}

export enum VaccinationSimpleGdi {
  VACC_DOSES = 'vacc-doses',
  VACC_PERSONS = 'vacc-persons',
  VACC_SYMPTOMS = 'vacc-symptoms',
  VACC_BREAKTHROUGH = 'vacc-breakthrough',
  VACC_STATUS = 'vacc-status',
}

export const epidemiologicGdiToSimpleGdi: Record<EpidemiologicGdiObject, EpidemiologicSimpleGdi> = {
  [GdiObject.CASE]: EpidemiologicSimpleGdi.CASE,
  [GdiObject.HOSP]: EpidemiologicSimpleGdi.HOSP,
  [GdiObject.DEATH]: EpidemiologicSimpleGdi.DEATH,
  [GdiObject.TEST]: EpidemiologicSimpleGdi.TEST,
}
export const vaccinationGdiToSimpleGdi: Record<VaccinationGdiObject, VaccinationSimpleGdi> = {
  [GdiObject.VACC_DOSES]: VaccinationSimpleGdi.VACC_DOSES,
  [GdiObject.VACC_PERSONS]: VaccinationSimpleGdi.VACC_PERSONS,
  [GdiObject.VACC_SYMPTOMS]: VaccinationSimpleGdi.VACC_SYMPTOMS,
  [GdiObject.VACC_BREAKTHROUGH]: VaccinationSimpleGdi.VACC_BREAKTHROUGH,
  [GdiObject.EPI_VACC_STATUS]: VaccinationSimpleGdi.VACC_STATUS,
}

export type EpidemiologicGeoValues =
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
  | GdiVariant.SUM28D
  | GdiVariant.INZ_28D
  | GdiVariant.SUM14D
  | GdiVariant.INZ_14D

export type EpidemiologicTestGeoValues =
  | EpidemiologicGeoValues
  | GdiVariant.PRCT_TOTAL_POSTEST_ANTIGEN
  | GdiVariant.PRCT_TOTAL_POSTEST_PCR
  | GdiVariant.PRCT_P2_POSTEST_ANTIGEN
  | GdiVariant.PRCT_P2_POSTEST_PCR
  | GdiVariant.PRCT_P2B_POSTEST_ANTIGEN
  | GdiVariant.PRCT_P2B_POSTEST_PCR
  | GdiVariant.PRCT_P3_POSTEST_ANTIGEN
  | GdiVariant.PRCT_P3_POSTEST_PCR
  | GdiVariant.PRCT_P4_POSTEST_ANTIGEN
  | GdiVariant.PRCT_P4_POSTEST_PCR
  | GdiVariant.PRCT_P5_POSTEST_ANTIGEN
  | GdiVariant.PRCT_P5_POSTEST_PCR
  | GdiVariant.PRCT_28D_POSTEST_ANTIGEN
  | GdiVariant.PRCT_28D_POSTEST_PCR
  | GdiVariant.PRCT_14D_POSTEST_ANTIGEN
  | GdiVariant.PRCT_14D_POSTEST_PCR

export type EpidemiologicDevValuesDEF =
  | GdiVariant.VALUE
  | GdiVariant.ROLLMEAN_7D
  | GdiVariant.ROLLSUM_14D
  | GdiVariant.INZ
  | GdiVariant.INZ_ROLLMEAN_7D
  | GdiVariant.INZ_ROLLMEAN_7D_CHFL
  | GdiVariant.INZ_ROLLSUM_14D
  | GdiVariant.INZ_ROLLSUM_14D_CHFL
  | GdiVariant.VALUE_PREVIOUS
  | GdiVariant.VALUE_NEWLY_REPORTED
export type EpidemiologicDevValuesOPT =
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
  | GdiVariant.SUM28D
  | GdiVariant.INZ_28D
  | GdiVariant.SUM14D
  | GdiVariant.INZ_14D

export type EpidemiologicTestDevValuesDEF =
  | GdiVariant.VALUE
  | GdiVariant.ROLLMEAN_7D
  | GdiVariant.VALUE_PCR
  | GdiVariant.VALUE_ANTIGEN
  | GdiVariant.INZ
  | GdiVariant.INZ_ROLLMEAN_7D
  | GdiVariant.INZ_ROLLMEAN_7D_CHFL
  | GdiVariant.INZ_PCR
  | GdiVariant.INZ_ANTIGEN
  | GdiVariant.PRCT_POSTEST_PCR
  | GdiVariant.PRCT_POSTEST_ANTIGEN

export type EpidemiologicTestDevValuesOPT =
  | EpidemiologicDevValuesOPT
  | GdiVariant.TOTAL_PCR
  | GdiVariant.INZ_TOTAL_PCR
  | GdiVariant.TOTAL_ANTIGEN
  | GdiVariant.INZ_TOTAL_ANTIGEN
  | GdiVariant.SUMP2_PCR
  | GdiVariant.INZ_P2_PCR
  | GdiVariant.SUMP2_ANTIGEN
  | GdiVariant.INZ_P2_ANTIGEN
  | GdiVariant.SUMP2B_PCR
  | GdiVariant.INZ_P2B_PCR
  | GdiVariant.SUMP2B_ANTIGEN
  | GdiVariant.INZ_P2B_ANTIGEN
  | GdiVariant.SUMP3_PCR
  | GdiVariant.INZ_P3_PCR
  | GdiVariant.SUMP3_ANTIGEN
  | GdiVariant.INZ_P3_ANTIGEN
  | GdiVariant.SUMP4_PCR
  | GdiVariant.INZ_P4_PCR
  | GdiVariant.SUMP4_ANTIGEN
  | GdiVariant.INZ_P4_ANTIGEN
  | GdiVariant.SUMP5_PCR
  | GdiVariant.INZ_P5_PCR
  | GdiVariant.SUMP5_ANTIGEN
  | GdiVariant.INZ_P5_ANTIGEN
  | GdiVariant.SUM28D_PCR
  | GdiVariant.INZ_28D_PCR
  | GdiVariant.SUM28D_ANTIGEN
  | GdiVariant.INZ_28D_ANTIGEN
  | GdiVariant.SUM14D_PCR
  | GdiVariant.INZ_14D_PCR
  | GdiVariant.SUM14D_ANTIGEN
  | GdiVariant.INZ_14D_ANTIGEN

// actual file type
export interface EpidemiologicGeographyDataBase<T extends string> extends GdiObjectTimeFrameContext {
  chFlData: InlineValues<T>
  chData: InlineValues<T>
  cantonData: CantonData<T>
}

export interface EpidemiologicGeographyData extends EpidemiologicGeographyDataBase<EpidemiologicGeoValues> {
  gdiObject: GdiObject.CASE | GdiObject.HOSP | GdiObject.DEATH
}

export interface EpidemiologicTestGeographyData extends EpidemiologicGeographyDataBase<EpidemiologicTestGeoValues> {
  gdiObject: GdiObject.TEST
}

export type EpidemiologicVaccGeoValues = GdiVariant.TOTAL | GdiVariant.INZ_TOTAL

export type EpidemiologicVaccGeoUnitData = InlineValues<EpidemiologicVaccGeoValues>

export interface EpidemiologicVaccDosesDailyGeoValues {
  [GdiSubset.VACC_DOSES_DELIV]: EpidemiologicVaccGeoUnitData
  [GdiSubset.VACC_DOSES_CONTINGENT]: EpidemiologicVaccGeoUnitData
  [GdiSubset.VACC_DOSES_ADMIN]: EpidemiologicVaccGeoUnitData
}

export interface EpidemiologicVaccDosesGeographyData extends GdiObjectTimespanContext {
  gdiObject: GdiObject.VACC_DOSES
  chFlData: EpidemiologicVaccDosesDailyGeoValues
  chData: EpidemiologicVaccDosesDailyGeoValues
  cantonData: { [key in CantonGeoUnit]: EpidemiologicVaccDosesDailyGeoValues }
  aaData: EpidemiologicVaccDosesDailyGeoValues
  vaccSourceDates: {
    [GdiSubset.VACC_DOSES_DELIV]: string
    [GdiSubset.VACC_DOSES_ADMIN]: string
    [GdiSubset.VACC_DOSES_CONTINGENT]: string
    detailed: string
  }
}

export interface EpidemiologicVaccPersonsGeoValues {
  [GdiSubset.VACC_PERSONS_FULL]: EpidemiologicVaccGeoUnitData
  [GdiSubset.VACC_PERSONS_FIRST_BOOSTER]: EpidemiologicVaccGeoUnitData
  [GdiSubset.VACC_PERSONS_MIN_ONE_DOSE]: EpidemiologicVaccGeoUnitData
  [GdiSubset.VACC_PERSONS_PARTIAL]: EpidemiologicVaccGeoUnitData
}

export interface EpidemiologicVaccPersonsGeoBaseData {
  timeSpan: TimeSpan
  chFlData: EpidemiologicVaccPersonsGeoValues
  chData: EpidemiologicVaccPersonsGeoValues
  cantonData: { [key in CantonGeoUnit]: EpidemiologicVaccPersonsGeoValues }
}

export interface EpidemiologicVaccPersonsGeoBaseDailyData extends EpidemiologicVaccPersonsGeoBaseData {
  neighboringChFlData?: EpidemiologicVaccPersonsGeoValues
  unknownData?: EpidemiologicVaccPersonsGeoValues
}

export interface EpidemiologicVaccPersonsDailyGeoValues {
  [GdiSubset.VACC_PERSONS_FULL]: EpidemiologicVaccGeoUnitData
  [GdiSubset.VACC_PERSONS_MIN_ONE_DOSE]: EpidemiologicVaccGeoUnitData
  [GdiSubset.VACC_PERSONS_PARTIAL]: EpidemiologicVaccGeoUnitData
}

export interface EpidemiologicVaccPersonsGeoData extends GdiObjectContext {
  gdiObject: GdiObject.VACC_PERSONS
  dailyData: EpidemiologicVaccPersonsGeoBaseDailyData
  dailyData12Plus: EpidemiologicVaccPersonsGeoBaseDailyData
  weeklyData: {
    [AgeRangeByVaccinationStrategy.A_5_11]: EpidemiologicVaccPersonsGeoBaseData
    [AgeRangeByVaccinationStrategy.A_12_15]: EpidemiologicVaccPersonsGeoBaseData
    [AgeRangeByVaccinationStrategy.A_16_64]: EpidemiologicVaccPersonsGeoBaseData
    [AgeRangeByVaccinationStrategy.A_65_PLUS]: EpidemiologicVaccPersonsGeoBaseData
  }
}

export type EpidemiologicVaccTimelineValuesDEF = GdiVariant.TOTAL | GdiVariant.INZ_TOTAL
export type EpidemiologicVaccTimelineValuesOPT =
  | GdiVariant.INZ_TOTAL_CHFL
  | GdiVariant.VALUE
  | GdiVariant.INZ
  | GdiVariant.ROLLMEAN_7D
  | GdiVariant.INZ_ROLLMEAN_7D
  | GdiVariant.INZ_ROLLMEAN_7D_CHFL

export type EpidemiologicVaccDosesAdminTimelineEntry = InlineValues<EpidemiologicVaccTimelineValuesDEF> &
  InlineValuesOpt<EpidemiologicVaccTimelineValuesOPT>
export type EpidemiologicVaccDosesDelivTimelineEntry = InlineValues<EpidemiologicVaccTimelineValuesDEF>
export type EpidemiologicVaccDosesContingentTimelineEntry = InlineValues<EpidemiologicVaccTimelineValuesDEF>
export type EpidemiologicVaccPersonsTimelineEntry = InlineValues<EpidemiologicVaccTimelineValuesDEF> &
  InlineValuesOpt<EpidemiologicVaccTimelineValuesOPT>

export type EpidemiologicVaccDosesDevelopmentEntry = { date: string } & {
  [GdiSubset.VACC_DOSES_DELIV]: EpidemiologicVaccDosesDelivTimelineEntry
  [GdiSubset.VACC_DOSES_CONTINGENT]: EpidemiologicVaccDosesContingentTimelineEntry
  [GdiSubset.VACC_DOSES_ADMIN]: EpidemiologicVaccDosesAdminTimelineEntry
  [GdiSubset.VACC_DOSES_RECEIVED]: EpidemiologicVaccDosesAdminTimelineEntry
}

export interface EpidemiologicVaccDosesDevelopmentData extends GdiObjectTimespanContext {
  gdiObject: GdiObject.VACC_DOSES
  dailyTimelineAvailable: boolean
  values: EpidemiologicVaccDosesDevelopmentEntry[]
  vaccSourceDates: {
    [GdiSubset.VACC_DOSES_DELIV]: string
    [GdiSubset.VACC_DOSES_CONTINGENT]: string
    [GdiSubset.VACC_DOSES_ADMIN]: string
  }
}

export enum VaccinationVaccineInvidual {
  PFIZER_BIONTECH = 'pfizerBiontech',
  MODERNA = 'moderna',
  JOHNSON_JOHNSON = 'johnson_johnson',
}

export enum VaccinationVaccineGroups {
  ALL = 'all',
}

export enum VaccinationVaccineSymptoms {
  ALL = 'all',
  UNKNOWN = 'unknown',
  PFIZER_BIONTECH = 'pfizerBiontech',
  MODERNA = 'moderna',
  JOHNSON_JOHNSON = 'johnson_johnson',
}

export type VaccinationVaccine = VaccinationVaccineInvidual | VaccinationVaccineGroups

export type EpidemiologicVaccVaccineTimelineValues =
  | GdiVariant.VALUE
  | GdiVariant.INZ
  | GdiVariant.TOTAL
  | GdiVariant.INZ_TOTAL
  | GdiVariant.ROLLMEAN_7D
  | GdiVariant.INZ_ROLLMEAN_7D

export type EpidemiologicVaccVaccineTimelineEntry = InlineValues<EpidemiologicVaccVaccineTimelineValues>

export interface EpidemiologicVaccPersonsVaccineDevelopmentEntry {
  date: string
  [GdiSubset.VACC_PERSONS_FULL]: Record<VaccinationVaccine | 'all', EpidemiologicVaccVaccineTimelineEntry>
}

export interface EpidemiologicVaccDosesVaccineDevelopmentEntry {
  date: string
  [GdiSubset.VACC_DOSES_RECEIVED]: Record<VaccinationVaccine, EpidemiologicVaccVaccineTimelineEntry>
  [GdiSubset.VACC_DOSES_DELIV]: Record<VaccinationVaccine, EpidemiologicVaccVaccineTimelineEntry>
  [GdiSubset.VACC_DOSES_ADMIN]: Record<VaccinationVaccine, EpidemiologicVaccVaccineTimelineEntry>
}

export type EpidemiologicVaccVaccineDevelopmentEntry =
  | EpidemiologicVaccPersonsVaccineDevelopmentEntry
  | EpidemiologicVaccDosesVaccineDevelopmentEntry

export interface EpidemiologicVaccVaccineDevelopmentDataBase extends GdiObjectTimespanContext {
  gdiObject: GdiObject.VACC_DOSES | GdiObject.VACC_PERSONS
  values: EpidemiologicVaccVaccineDevelopmentEntry[]
}

export interface EpidemiologicVaccDosesVaccineDevelopmentData extends EpidemiologicVaccVaccineDevelopmentDataBase {
  gdiObject: GdiObject.VACC_DOSES
  values: EpidemiologicVaccDosesVaccineDevelopmentEntry[]
  vaccSourceDates: {
    [GdiSubset.VACC_DOSES_RECEIVED]: string
    [GdiSubset.VACC_DOSES_DELIV]: string
    [GdiSubset.VACC_DOSES_ADMIN]: string
    detailed: string
  }
}

export interface EpidemiologicVaccPersonsVaccineDevelopmentData extends EpidemiologicVaccVaccineDevelopmentDataBase {
  gdiObject: GdiObject.VACC_PERSONS
  values: EpidemiologicVaccPersonsVaccineDevelopmentEntry[]
}

export type EpidemiologicVaccVaccineDevelopmentData =
  | EpidemiologicVaccDosesVaccineDevelopmentData
  | EpidemiologicVaccPersonsVaccineDevelopmentData

export type EpidemiologicVaccSymptomsTimelineEntry = InlineValues<GdiVariant.TOTAL>

export interface EpidemiologicVaccSymptomsDevelopmentEntry {
  date: string
  [GdiSubset.VACC_DOSES_ADMIN]: Record<VaccinationVaccineSymptoms, EpidemiologicVaccSymptomsTimelineEntry>
  [GdiSubset.VACC_SYMPTOMS_ALL]: Record<VaccinationVaccineSymptoms, EpidemiologicVaccSymptomsTimelineEntry>
  [GdiSubset.VACC_SYMPTOMS_SERIOUS]: Record<VaccinationVaccineSymptoms, EpidemiologicVaccSymptomsTimelineEntry>
  [GdiSubset.VACC_SYMPTOMS_NOT_SERIOUS]: Record<VaccinationVaccineSymptoms, EpidemiologicVaccSymptomsTimelineEntry>
}

export interface EpidemiologicVaccSymptomsDevelopmentData extends GdiObjectTimespanContext {
  gdiObject: GdiObject.VACC_SYMPTOMS
  values: EpidemiologicVaccSymptomsDevelopmentEntry[]
  vaccSourceDates: {
    [GdiSubset.VACC_DOSES_ADMIN]: string
    [GdiSubset.VACC_SYMPTOMS_ALL]: string
  }
}

export interface EpidemiologicVaccSymptomsDemographyEntry {
  date: string
  [GdiSubset.VACC_SYMPTOMS_ALL]: Record<VaccSymptomsAgeRange, EpidemiologicVaccSymptomsTimelineEntry>
}

export interface EpidemiologicVaccSymptomsDemographyData extends GdiObjectTimespanContext {
  gdiObject: GdiObject.VACC_SYMPTOMS
  values: EpidemiologicVaccSymptomsDemographyEntry[]
}

export enum VaccSymptomsAgeRange {
  A_0_1 = '0 - 1',
  A_2_11 = '2 - 11',
  A_12_17 = '12 - 17',
  A_18_44 = '18 - 44',
  A_45_64 = '45 - 64',
  A_65_74 = '65 - 74',
  A_75_PLUS = '75+',
  A_UNKNOWN = 'unknown',
}

// TODO: refactor "-" to camelCase
export enum VaccinationLocation {
  HOSPITAL = 'hospital',
  VACCINATION_CENTRE = 'vaccination-centre',
  NURSING_HOME = 'nursing-home',
  MEDICAL_PRACTICE = 'medical-practice',
  PHARMACY = 'pharmacy',
  UNKNOWN = 'unknown',
}

export type VaccinationLocationKey =
  | 'HOSPITAL'
  | 'VACCINATION_CENTRE'
  | 'NURSING_HOME'
  | 'MEDICAL_PRACTICE'
  | 'PHARMACY'
  | 'UNKNOWN'

export type EpidemiologicVaccDosesAdminLocationTimelineValues =
  | GdiVariant.VALUE
  | GdiVariant.INZ
  | GdiVariant.TOTAL
  | GdiVariant.INZ_TOTAL
export type EpidemiologicVaccDosesAdminLocationTimelineEntry =
  InlineValues<EpidemiologicVaccDosesAdminLocationTimelineValues>

export type EpidemiologicVaccDosesLocationDevelopmentEntry = {
  isoWeek: string
  start: string
  end: string
} & {
  [GdiSubset.VACC_DOSES_ADMIN]: Record<VaccinationLocation, EpidemiologicVaccDosesAdminLocationTimelineEntry>
}

export interface EpidemiologicVaccDosesLocationDevelopmentData extends GdiObjectTimespanContext {
  gdiObject: GdiObject.VACC_DOSES
  values: EpidemiologicVaccDosesLocationDevelopmentEntry[]
}

export enum VaccinationIndicationGeneral {
  AGE = 'age',
  CHRONIC_DISEASE = 'chronic-disease',
  MEDICAL_PROFESSION = 'medical-profession',
  CONTACT_VULNERABLE = 'contact-vulnerable',
  CONTACT_COMMUNITY = 'contact-community',
  OTHER = 'other',
}

// TODO: refactor "-" to camelCase
export enum VaccinationIndicationRiskGroups {
  RISK_GROUPS = 'risk-groups',
  ALL = 'all',
  NOT_VACCINATED = 'not-vaccinated',
}

export type VaccinationIndication = VaccinationIndicationGeneral | VaccinationIndicationRiskGroups

export type EpidemiologicVaccIndicationTimelineValues =
  | GdiVariant.VALUE
  | GdiVariant.INZ
  | GdiVariant.TOTAL
  | GdiVariant.INZ_TOTAL
  | GdiVariant.PERCENTAGE
  | GdiVariant.PERCENTAGE_TOTAL
  | GdiVariant.PERCENTAGE_POPULATION_TOTAL

export type EpidemiologicVaccIndicationTimelineEntry = InlineValues<EpidemiologicVaccIndicationTimelineValues>

export interface EpidemiologicVaccPersonsIndicationDevelopmentEntry {
  isoWeek: string
  start: string
  end: string
  [GdiSubset.VACC_PERSONS_FULL]: Record<VaccinationIndication, EpidemiologicVaccIndicationTimelineEntry>
}

export interface EpidemiologicVaccDosesAdministeredIndicationDevelopmentEntry {
  isoWeek: string
  start: string
  end: string
  [GdiSubset.VACC_DOSES_ADMIN]: Record<VaccinationIndication, EpidemiologicVaccIndicationTimelineEntry>
}

export type EpidemiologicVaccIndicationDevelopmentEntry =
  | EpidemiologicVaccPersonsIndicationDevelopmentEntry
  | EpidemiologicVaccDosesAdministeredIndicationDevelopmentEntry

export interface EpidemiologicVaccIndicationDevelopmentDataBase extends GdiObjectTimespanContext {
  gdiObject: GdiObject.VACC_DOSES | GdiObject.VACC_PERSONS
  values: EpidemiologicVaccIndicationDevelopmentEntry[]
}

export interface EpidemiologicVaccDosesAdministeredIndicationDevelopmentData
  extends EpidemiologicVaccIndicationDevelopmentDataBase {
  gdiObject: GdiObject.VACC_DOSES
  values: EpidemiologicVaccDosesAdministeredIndicationDevelopmentEntry[]
}

export interface EpidemiologicVaccPersonsIndicationDevelopmentData
  extends EpidemiologicVaccIndicationDevelopmentDataBase {
  gdiObject: GdiObject.VACC_PERSONS
  values: EpidemiologicVaccPersonsIndicationDevelopmentEntry[]
}

export type EpidemiologicVaccIndicationDevelopmentData =
  | EpidemiologicVaccDosesAdministeredIndicationDevelopmentData
  | EpidemiologicVaccPersonsIndicationDevelopmentData

export type EpidemiologicVaccPersonsDevelopmentEntry = { date: string } & {
  [GdiSubset.VACC_PERSONS_FULL]: EpidemiologicVaccPersonsTimelineEntry
  [GdiSubset.VACC_PERSONS_FIRST_BOOSTER]: EpidemiologicVaccPersonsTimelineEntry
  [GdiSubset.VACC_PERSONS_MIN_ONE_DOSE]: EpidemiologicVaccPersonsTimelineEntry
  [GdiSubset.VACC_PERSONS_PARTIAL]: EpidemiologicVaccPersonsTimelineEntry
  [GdiSubset.VACC_DOSES_ADMIN]: EpidemiologicVaccDosesAdminTimelineEntry
}

export interface EpidemiologicVaccPersonsDevelopmentData extends GdiObjectTimespanContext {
  gdiObject: GdiObject.VACC_PERSONS
  dailyTimelineAvailable: boolean
  values: EpidemiologicVaccPersonsDevelopmentEntry[]
  vaccSourceDates: {
    [GdiSubset.VACC_PERSONS_FULL]: string
    [GdiSubset.VACC_DOSES_ADMIN]: string
  }
}

export type EpiTimelineEntry<DEF extends string, OPT extends string> = { date: string } & InlineValues<DEF> &
  InlineValuesOpt<OPT>

// actual file type
export interface EpidemiologicDevelopmentDataBase<DEF extends string, OPT extends string>
  extends GdiObjectTimeFrameContext {
  values: EpiTimelineEntry<DEF, OPT>[]
}

export interface EpidemiologicDevelopmentData
  extends EpidemiologicDevelopmentDataBase<EpidemiologicDevValuesDEF, EpidemiologicDevValuesOPT> {
  gdiObject: GdiObject.CASE | GdiObject.HOSP | GdiObject.DEATH
}

export interface EpidemiologicTestDevelopmentData
  extends EpidemiologicDevelopmentDataBase<EpidemiologicTestDevValuesDEF, EpidemiologicTestDevValuesOPT> {
  gdiObject: GdiObject.TEST
}

// actual file type
export interface EpidemiologicVaccDemographyData extends GdiObjectTimespanContext {
  gdiObject: VaccinationGdiObject
  ageData: VaccinationAgeBucketData[]
  genderData: GenderBucketData[]
}

// actual file type
export interface EpidemiologicVaccDemographyDataV2 extends GdiObjectTimespanContext {
  gdiObject: VaccinationGdiObject
  ageData: VaccinationAgeBucketDataVaccPersons[]
  genderData: VaccinationGenderBucketDataVaccPersons[]
}

// actual file type
export interface EpidemiologicDemographyData extends GdiObjectTimeFrameContext {
  ageData: AgeBucketData[]
  genderData: GenderBucketData[]
}
