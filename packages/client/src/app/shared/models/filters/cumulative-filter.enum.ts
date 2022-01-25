export enum CumulativeFilter {
  DAILY = 'daily',
  TWO_WEEK_SUM = '14d_sum',
  CUMULATIVE = 'cumulative',
}

export const DEFAULT_CUMULATIVE_FILTER = CumulativeFilter.DAILY
