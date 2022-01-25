import { ChangeDetectionStrategy, Component } from '@angular/core'
import { WeeklyReportHospCapacityDataCard } from '@c19/commons'
import { ShareWeeklyReportBaseComponent } from '../share-weekly-report-base.component'

@Component({
  template: `<bag-weekly-report-card-hosp-capacity-icu
    [data]="data"
    [facet]="facet"
  ></bag-weekly-report-card-hosp-capacity-icu>`,
  styleUrls: ['../share-weekly-report-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareWeeklyReportHospCapacityIcuComponent extends ShareWeeklyReportBaseComponent<WeeklyReportHospCapacityDataCard> {}
