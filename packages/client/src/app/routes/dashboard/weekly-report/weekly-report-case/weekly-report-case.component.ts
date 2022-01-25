import { ChangeDetectionStrategy, Component } from '@angular/core'
import { EpidemiologicSimpleGdi } from '@c19/commons'
import { WeeklyReportBaseDetailComponent } from '../weekly-report-base-detail.component'

@Component({
  selector: 'bag-weekly-report-case',
  templateUrl: './weekly-report-case.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportCaseComponent extends WeeklyReportBaseDetailComponent {
  readonly simpleGdi = EpidemiologicSimpleGdi.CASE
}
