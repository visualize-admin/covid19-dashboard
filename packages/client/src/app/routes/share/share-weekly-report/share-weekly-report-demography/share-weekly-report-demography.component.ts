import { ChangeDetectionStrategy, Component } from '@angular/core'
import { WeeklyReportEpidemiologicDemographyCard } from '@c19/commons'
import { ShareWeeklyReportBaseComponent } from '../share-weekly-report-base.component'

@Component({
  template: `<bag-weekly-report-card-demography [data]="data" [facet]="facet"></bag-weekly-report-card-demography>`,
  styleUrls: ['../share-weekly-report-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareWeeklyReportDemographyComponent extends ShareWeeklyReportBaseComponent<WeeklyReportEpidemiologicDemographyCard> {}
