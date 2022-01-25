import { OptionsDef } from '../option-def.type'
import { VaccDosesTypeFilter } from './vacc-doses-type-filter.enum'
import { VaccVaccineCumulativeFilter } from './vacc-vaccine-cumulative-filter.enum'

export enum VaccDosesCumulativeTypeFilter {
  TOTAL_RECEIVED = 'totalReceived',
  TOTAL_DELIVERED = 'totalDelivered',
  TOTAL_ADMINISTERED = 'totalAdministered',
  DAILY_ADMINISTERED = 'dailyAdministered',
}

export const vaccDosesCumulativeTypeFilterKey: Record<VaccDosesCumulativeTypeFilter, string> = {
  [VaccDosesCumulativeTypeFilter.TOTAL_RECEIVED]: 'Vaccination.DosesCumulativeTypeFilter.TotalReceived',
  [VaccDosesCumulativeTypeFilter.TOTAL_DELIVERED]: 'Vaccination.DosesCumulativeTypeFilter.TotalDelivered',
  [VaccDosesCumulativeTypeFilter.TOTAL_ADMINISTERED]: 'Vaccination.DosesCumulativeTypeFilter.TotalAdministered',
  [VaccDosesCumulativeTypeFilter.DAILY_ADMINISTERED]: 'Vaccination.DosesCumulativeTypeFilter.DailyAdministered',
}

export const vaccDosesCumulativeTypeFilterMap: Record<
  VaccDosesCumulativeTypeFilter,
  { cumulative: VaccVaccineCumulativeFilter; type: VaccDosesTypeFilter }
> = {
  [VaccDosesCumulativeTypeFilter.TOTAL_RECEIVED]: {
    cumulative: VaccVaccineCumulativeFilter.TOTAL,
    type: VaccDosesTypeFilter.RECEIVED,
  },
  [VaccDosesCumulativeTypeFilter.TOTAL_DELIVERED]: {
    cumulative: VaccVaccineCumulativeFilter.TOTAL,
    type: VaccDosesTypeFilter.DELIVERED,
  },
  [VaccDosesCumulativeTypeFilter.TOTAL_ADMINISTERED]: {
    cumulative: VaccVaccineCumulativeFilter.TOTAL,
    type: VaccDosesTypeFilter.ADMINISTERED,
  },
  [VaccDosesCumulativeTypeFilter.DAILY_ADMINISTERED]: {
    cumulative: VaccVaccineCumulativeFilter.DAILY,
    type: VaccDosesTypeFilter.ADMINISTERED,
  },
}

export const DEFAULT_VACC_DOSES_CUMULATIVE_TYPE_FILTER = VaccDosesCumulativeTypeFilter.TOTAL_ADMINISTERED

export function getVaccDosesCumulativeTypeFilterOptionGroups(
  defaultOption: VaccDosesCumulativeTypeFilter,
): { groupKey: string; options: OptionsDef<VaccDosesCumulativeTypeFilter> }[] {
  return [
    {
      groupKey: 'Vaccination.CumulativeFilter.Vaccine.Total',
      options: [
        VaccDosesCumulativeTypeFilter.TOTAL_RECEIVED,
        VaccDosesCumulativeTypeFilter.TOTAL_DELIVERED,
        VaccDosesCumulativeTypeFilter.TOTAL_ADMINISTERED,
      ].map((val) => ({
        key: vaccDosesCumulativeTypeFilterKey[val],
        val: val === defaultOption ? null : val,
      })),
    },
    {
      groupKey: 'Vaccination.CumulativeFilter.Vaccine.Daily',
      options: [VaccDosesCumulativeTypeFilter.DAILY_ADMINISTERED].map((val) => ({
        key: vaccDosesCumulativeTypeFilterKey[val],
        val: val === defaultOption ? null : val,
      })),
    },
  ]
}
