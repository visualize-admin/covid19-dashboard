import { ChangeDetectionStrategy, Component } from '@angular/core'
import { WeeklyReportPositivityRateGeographyCard } from '@c19/commons'
import { ShareWeeklyReportBaseComponent } from '../share-weekly-report-base.component'

@Component({
  template: `<bag-weekly-report-card-test-positivity
    [data]="data"
    [facet]="facet"
  ></bag-weekly-report-card-test-positivity>`,
  styleUrls: ['../share-weekly-report-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareWeeklyReportTestPositivityComponent extends ShareWeeklyReportBaseComponent<WeeklyReportPositivityRateGeographyCard> {}
