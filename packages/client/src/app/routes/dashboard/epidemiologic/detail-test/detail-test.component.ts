import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
  EpidemiologicSimpleGdi,
  EpidemiologicTestDevelopmentData,
  EpidemiologicTestGeographyData,
  EpidemiologicTestGeoValues,
  GdiVariant,
} from '@c19/commons'
import { TimeSlotFilter } from '../../../../shared/models/filters/time-slot-filter.enum'
import { EpidemiologicBaseDetailComponent } from '../epidemiologic-base-detail.component'

export const DETAIL_TEST_GDI_PCR: Record<TimeSlotFilter, EpidemiologicTestGeoValues> = {
  [TimeSlotFilter.TOTAL]: GdiVariant.PRCT_TOTAL_POSTEST_PCR,
  [TimeSlotFilter.PHASE_2]: GdiVariant.PRCT_P2_POSTEST_PCR,
  [TimeSlotFilter.PHASE_2B]: GdiVariant.PRCT_P2B_POSTEST_PCR,
  [TimeSlotFilter.PHASE_3]: GdiVariant.PRCT_P3_POSTEST_PCR,
  [TimeSlotFilter.PHASE_4]: GdiVariant.PRCT_P4_POSTEST_PCR,
  [TimeSlotFilter.PHASE_5]: GdiVariant.PRCT_P5_POSTEST_PCR,
  [TimeSlotFilter.LAST_4_WEEKS]: GdiVariant.PRCT_28D_POSTEST_PCR,
  [TimeSlotFilter.LAST_2_WEEKS]: GdiVariant.PRCT_14D_POSTEST_PCR,
}

export const DETAIL_TEST_GDI_ANTIGEN: Record<TimeSlotFilter, EpidemiologicTestGeoValues> = {
  [TimeSlotFilter.TOTAL]: GdiVariant.PRCT_TOTAL_POSTEST_ANTIGEN,
  [TimeSlotFilter.PHASE_2]: GdiVariant.PRCT_P2_POSTEST_ANTIGEN,
  [TimeSlotFilter.PHASE_2B]: GdiVariant.PRCT_P2B_POSTEST_ANTIGEN,
  [TimeSlotFilter.PHASE_3]: GdiVariant.PRCT_P3_POSTEST_ANTIGEN,
  [TimeSlotFilter.PHASE_4]: GdiVariant.PRCT_P4_POSTEST_ANTIGEN,
  [TimeSlotFilter.PHASE_5]: GdiVariant.PRCT_P5_POSTEST_ANTIGEN,
  [TimeSlotFilter.LAST_4_WEEKS]: GdiVariant.PRCT_28D_POSTEST_ANTIGEN,
  [TimeSlotFilter.LAST_2_WEEKS]: GdiVariant.PRCT_14D_POSTEST_ANTIGEN,
}

@Component({
  selector: 'bag-detail-test',
  templateUrl: './detail-test.component.html',
  styleUrls: ['../../base-detail.component.scss', '../epidemiologic-base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailTestComponent extends EpidemiologicBaseDetailComponent<
  EpidemiologicTestGeographyData,
  EpidemiologicTestDevelopmentData
> {
  readonly simpleGdi = EpidemiologicSimpleGdi.TEST
}
