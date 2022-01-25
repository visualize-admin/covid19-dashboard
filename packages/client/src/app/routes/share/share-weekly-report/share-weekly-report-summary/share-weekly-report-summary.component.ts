import { ChangeDetectionStrategy, Component } from '@angular/core'
import { WeeklySituationReportSummaryCard } from '@c19/commons'
import { ShareWeeklyReportBaseComponent } from '../share-weekly-report-base.component'

@Component({
  template: `<bag-weekly-report-card-summary [data]="data" [facet]="facet"></bag-weekly-report-card-summary>`,
  styleUrls: ['../share-weekly-report-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareWeeklyReportSummaryComponent extends ShareWeeklyReportBaseComponent<WeeklySituationReportSummaryCard> {}
