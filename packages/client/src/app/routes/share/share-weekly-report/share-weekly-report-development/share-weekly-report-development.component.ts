import { ChangeDetectionStrategy, Component } from '@angular/core'
import { WeeklySituationReportDevelopmentCard } from '@c19/commons'
import { ShareWeeklyReportBaseComponent } from '../share-weekly-report-base.component'

@Component({
  template: `<bag-weekly-report-card-development [data]="data" [facet]="facet"></bag-weekly-report-card-development>`,
  styleUrls: ['../share-weekly-report-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareWeeklyReportDevelopmentComponent extends ShareWeeklyReportBaseComponent<WeeklySituationReportDevelopmentCard> {}
