import { TimeFrames } from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { OptionsDef } from '../option-def.type'

export enum TimeSlotFilter {
  // the order matters (UI)
  TOTAL = 'total',
  PHASE_2 = 'phase2',
  PHASE_2B = 'phase2b',
  PHASE_3 = 'phase3',
  PHASE_4 = 'phase4',
  PHASE_5 = 'phase5',
  PHASE_6 = 'phase6',
  LAST_4_WEEKS = '28d',
  LAST_2_WEEKS = '14d',
}

export const DEFAULT_TIME_SLOT_FILTER_OVERVIEW = TimeSlotFilter.LAST_4_WEEKS
export const DEFAULT_TIME_SLOT_FILTER_DETAIL = TimeSlotFilter.PHASE_5
export const DEFAULT_TIME_SLOT_FILTER_HOSP_CAPACITY_DEV = TimeSlotFilter.PHASE_5
export const DEFAULT_TIME_SLOT_FILTER_INTERNATIONAL = TimeSlotFilter.PHASE_5
export const DEFAULT_TIME_SLOT_FILTER_REPRO_DEV = TimeSlotFilter.PHASE_5

export const timeSlotFilterKey: Record<TimeSlotFilter, string> = {
  [TimeSlotFilter.TOTAL]: 'TimeSlotFilter.Total',
  [TimeSlotFilter.PHASE_2]: 'TimeSlotFilter.P2',
  [TimeSlotFilter.PHASE_2B]: 'TimeSlotFilter.P2B',
  [TimeSlotFilter.PHASE_3]: 'TimeSlotFilter.P3',
  [TimeSlotFilter.PHASE_4]: 'TimeSlotFilter.P4',
  [TimeSlotFilter.PHASE_5]: 'TimeSlotFilter.P5',
  [TimeSlotFilter.PHASE_6]: 'TimeSlotFilter.P6',
  [TimeSlotFilter.LAST_4_WEEKS]: 'TimeSlotFilter.Last4Weeks',
  [TimeSlotFilter.LAST_2_WEEKS]: 'TimeSlotFilter.Last2Weeks',
}

export function getTimeSlotFilterOptions(defaultOption: TimeSlotFilter): OptionsDef<TimeSlotFilter> {
  const opts = <TimeSlotFilter[]>getEnumValues(TimeSlotFilter)
  return opts.map((val) => ({
    key: timeSlotFilterKey[val],
    val: val === defaultOption ? null : val,
  }))
}

export const timeSlotFilterTimeFrameKey: Record<TimeSlotFilter, keyof TimeFrames> = {
  [TimeSlotFilter.TOTAL]: 'tfTot',
  [TimeSlotFilter.PHASE_2]: 'tfP2',
  [TimeSlotFilter.PHASE_2B]: 'tfP2b',
  [TimeSlotFilter.PHASE_3]: 'tfP3',
  [TimeSlotFilter.PHASE_4]: 'tfP4',
  [TimeSlotFilter.PHASE_5]: 'tfP5',
  [TimeSlotFilter.PHASE_6]: 'tfP6',
  [TimeSlotFilter.LAST_4_WEEKS]: 'tf28d',
  [TimeSlotFilter.LAST_2_WEEKS]: 'tf14d',
}
