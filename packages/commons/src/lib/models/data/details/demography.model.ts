export enum AgeRange {
  // sorting relevant for data view
  A_80_PLUS = '80+',
  A_70_79 = '70-79',
  A_60_69 = '60-69',
  A_50_59 = '50-59',
  A_40_49 = '40-49',
  A_30_39 = '30-39',
  A_20_29 = '20-29',
  A_10_19 = '10-19',
  A_0_9 = '0-9',
}

export type AgeRangeKey =
  | 'A_80_PLUS'
  | 'A_70_79'
  | 'A_60_69'
  | 'A_50_59'
  | 'A_40_49'
  | 'A_30_39'
  | 'A_20_29'
  | 'A_10_19'
  | 'A_0_9'

export enum AgeRangeByVaccinationStrategy {
  A_5_11 = 'A_5_11',
  A_12_15 = 'A_12_15',
  A_16_64 = 'A_16_64',
  A_65_PLUS = 'A_65_PLUS',
}

export type AgeRangeByVaccinationStrategyKey = 'A_5_11' | 'A_12_15' | 'A_16_64' | 'A_65_PLUS'

/**
 *  Sex
 *
 *  unknown - If no gender information was provided for the associated data.
 *  male
 */
export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',
}

export enum HospCapacityType {
  COVID19 = 'covid',
  NON_COVID = 'non_covid',
  FREE = 'free',
}

export type SexKey = 'UNKNOWN' | 'MALE' | 'FEMALE'
