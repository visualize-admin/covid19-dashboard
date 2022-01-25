import { AgeRange } from './details'
import { GdiObject, GdiObjectTimespanContext, GdiVariant, InlineValues } from './shared'

export enum VaccineBreakthroughIndicator {
  DEATH = 'death',
  HOSP = 'hosp',
}

export enum VaccineType {
  ALL = 'all',
  PFIZER_BIONTECH = 'pfizerBiontech',
  MODERNA = 'moderna',
  JOHNSON_JOHNSON = 'johnsonJohnson',
  // not yet used:
  // UNKNOWN = 'unknown',
  // OTHER = 'other',
}

export enum VaccinationStatus {
  FULLY_VACCINATED = 'fullyVaccinated',
  FULLY_VACCINATED_NO_BOOSTER = 'fullyVaccinatedNoBooster',
  FULLY_VACCINATED_FIRST_BOOSTER = 'fullyVaccinatedFirstBooster',
  PARTIALLY_VACCINATED = 'partiallyVaccinated',
  NOT_VACCINATED = 'notVaccinated',
  UNKNOWN = 'unknown',
}

export type VaccinationStatusForPopulation =
  | VaccinationStatus.FULLY_VACCINATED
  | VaccinationStatus.FULLY_VACCINATED_FIRST_BOOSTER
  | VaccinationStatus.PARTIALLY_VACCINATED
  | VaccinationStatus.NOT_VACCINATED

export type VaccinationStatusDevelopmentEntryValues = InlineValues<
  | GdiVariant.VALUE
  | GdiVariant.INZ
  | GdiVariant.ROLLMEAN_7D
  | GdiVariant.INZ_ROLLMEAN_7D
  | GdiVariant.TOTAL
  | GdiVariant.INZ_TOTAL
  | GdiVariant.PERCENTAGE
  | GdiVariant.PERCENTAGE_TOTAL
  | GdiVariant.PERCENTAGE_ROLLMEAN_7D
>

export type VaccinationStatusVaccineDevelopmentEntryValues = InlineValues<
  | GdiVariant.VALUE
  | GdiVariant.ROLLMEAN_7D
  | GdiVariant.INZ
  | GdiVariant.INZ_ROLLMEAN_7D
  | GdiVariant.TOTAL
  | GdiVariant.INZ_TOTAL
>

export type VaccinationStatusDemographyEntryValues = InlineValues<
  GdiVariant.WEEK | GdiVariant.INZ_WEEK | GdiVariant.TOTAL | GdiVariant.INZ_TOTAL
>
export type VaccinationStatusPopulationDevelopmentEntryValues = InlineValues<GdiVariant.PERCENTAGE_POPULATION_TOTAL>

export type VaccinationStatusDevelopmentEntry = Record<VaccinationStatus, VaccinationStatusDevelopmentEntryValues> & {
  date: string
}

export enum VaccineVaccinationStatus {
  FULLY_VACCINATED_MODERNA = 'fullyVaccinatedModerna',
  FULLY_VACCINATED_PFIZER_BIONTECH = 'fullyVaccinatedPfizerBiontech',
  FULLY_VACCINATED_JOHNSON_JOHNSON = 'fullyVaccinatedJohnsonJohnson',
  PARTIALLY_VACCINATED_MODERNA = 'partiallyVaccinatedModerna',
  PARTIALLY_VACCINATED_PFIZER_BIONTECH = 'partiallyVaccinatedPfizerBiontech',
  NOT_VACCINATED = 'notVaccinated',
  UNKNOWN = 'unknown', // not currently visualized
}

export type VaccineVaccinationStatusWithoutUnknown = Exclude<VaccineVaccinationStatus, VaccineVaccinationStatus.UNKNOWN>

export type VaccinationStatusVaccineDevelopmentEntry = Record<
  VaccineVaccinationStatus,
  VaccinationStatusVaccineDevelopmentEntryValues
> & {
  date: string
}

export type VaccinationVaccStatusAgeRangeEntry = Record<
  AgeRange,
  Record<VaccinationStatus, VaccinationStatusDemographyEntryValues>
> & {
  start: string
  end: string
  isoWeek: string
}

export type VaccinationStatusDataCompletenessRecord = { date: string; completeness: number | null }

export type VaccinationStatusPopulationDevelopmentEntry = Record<
  VaccinationStatusForPopulation,
  VaccinationStatusPopulationDevelopmentEntryValues
> & {
  date: string
}

export type VaccinationStatusVaccinePopulationDevelopmentEntry = Record<
  VaccineVaccinationStatusWithoutUnknown,
  VaccinationStatusPopulationDevelopmentEntryValues | null
> & {
  date: string
}

// actual file type
export interface VaccinationStatusDevelopmentData extends GdiObjectTimespanContext {
  gdiObject: GdiObject.EPI_VACC_STATUS
  values: Record<VaccineBreakthroughIndicator, VaccinationStatusDevelopmentEntry[]>
  completenessValues: Record<VaccineBreakthroughIndicator, VaccinationStatusDataCompletenessRecord[]>
  populationValues: VaccinationStatusPopulationDevelopmentEntry[]
}

// actual file type
export interface VaccinationStatusVaccineDevelopmentData extends GdiObjectTimespanContext {
  gdiObject: GdiObject.EPI_VACC_STATUS
  values: Record<VaccineBreakthroughIndicator, VaccinationStatusVaccineDevelopmentEntry[]>
  completenessValues: Record<VaccineBreakthroughIndicator, VaccinationStatusDataCompletenessRecord[]>
  populationValues: VaccinationStatusVaccinePopulationDevelopmentEntry[]
}

// actual file type
export interface VaccinationStatusDemographyData extends GdiObjectTimespanContext {
  gdiObject: GdiObject.EPI_VACC_STATUS
  ageData: Record<VaccineBreakthroughIndicator, VaccinationVaccStatusAgeRangeEntry[]>
}
