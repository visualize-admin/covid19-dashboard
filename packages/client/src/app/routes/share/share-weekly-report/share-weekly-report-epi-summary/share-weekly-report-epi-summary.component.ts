import { ChangeDetectionStrategy, Component } from '@angular/core'
import { WeeklyReportEpidemiologicSummaryCard } from '@c19/commons'
import { ShareWeeklyReportBaseComponent } from '../share-weekly-report-base.component'

@Component({
  template: `<bag-weekly-report-card-epi-summary [data]="data" [facet]="facet"></bag-weekly-report-card-epi-summary>`,
  styleUrls: ['../share-weekly-report-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareWeeklyReportEpiSummaryComponent extends ShareWeeklyReportBaseComponent<WeeklyReportEpidemiologicSummaryCard> {}
