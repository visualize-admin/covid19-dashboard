import { GdiVariant } from '@c19/commons'
import { TimeSlotFilter } from '../shared/models/filters/time-slot-filter.enum'

// no type for the variable but the value `as const` -- makes it more useful and helps to get rid of castings
// just make sure, every TimeSlotFilter contains every prop
// basically the type is (using the type while adding a new props helps with autocompletion):
// : Record<TimeSlotFilter, Record<'sum' | 'inz' | 'sumPcr' | 'sumAtg' | 'prctPosPcr' | 'prctPosAtg', GdiVariant>>
export const timeframeGdiVariantMapping = {
  [TimeSlotFilter.TOTAL]: {
    sum: GdiVariant.TOTAL,
    inz: GdiVariant.INZ_TOTAL,
    prctPos: GdiVariant.PRCT_TOTAL_POSTEST,
  },
  [TimeSlotFilter.PHASE_2]: {
    sum: GdiVariant.SUMP2,
    inz: GdiVariant.INZ_P2,
    prctPos: GdiVariant.PRCT_P2_POSTEST,
  },
  [TimeSlotFilter.PHASE_2B]: {
    sum: GdiVariant.SUMP2B,
    inz: GdiVariant.INZ_P2B,
    prctPos: GdiVariant.PRCT_P2B_POSTEST,
  },
  [TimeSlotFilter.PHASE_3]: {
    sum: GdiVariant.SUMP3,
    inz: GdiVariant.INZ_P3,
    prctPos: GdiVariant.PRCT_P3_POSTEST,
  },
  [TimeSlotFilter.PHASE_4]: {
    sum: GdiVariant.SUMP4,
    inz: GdiVariant.INZ_P4,
    prctPos: GdiVariant.PRCT_P4_POSTEST,
  },
  [TimeSlotFilter.PHASE_5]: {
    sum: GdiVariant.SUMP5,
    inz: GdiVariant.INZ_P5,
    prctPos: GdiVariant.PRCT_P5_POSTEST,
  },
  [TimeSlotFilter.LAST_4_WEEKS]: {
    sum: GdiVariant.SUM28D,
    inz: GdiVariant.INZ_28D,
    prctPos: GdiVariant.PRCT_28D_POSTEST,
  },
  [TimeSlotFilter.LAST_2_WEEKS]: {
    sum: GdiVariant.SUM14D,
    inz: GdiVariant.INZ_14D,
    prctPos: GdiVariant.PRCT_14D_POSTEST,
  },
} as const
