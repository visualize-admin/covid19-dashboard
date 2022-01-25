import { ChangeDetectionStrategy, Component } from '@angular/core'
import { WeeklySitutationReportOverviewCard } from '@c19/commons'
import { ShareWeeklyReportBaseComponent } from '../share-weekly-report-base.component'

@Component({
  template: `<bag-weekly-report-card-overview [data]="data" [facet]="facet"></bag-weekly-report-card-overview>`,
  styleUrls: ['../share-weekly-report-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareWeeklyReportOverviewComponent extends ShareWeeklyReportBaseComponent<WeeklySitutationReportOverviewCard> {}
