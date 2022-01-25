import { ChangeDetectionStrategy, Component } from '@angular/core'
import { EpidemiologicSimpleGdi, WeeklyReportPositivityRateGeographyCard } from '@c19/commons'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { WeeklyReportDataPair } from '../../../../core/data/data.service'
import { WeeklyReportBaseDetailComponent } from '../weekly-report-base-detail.component'

@Component({
  selector: 'bag-weekly-report-test',
  templateUrl: './weekly-report-test.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportTestComponent extends WeeklyReportBaseDetailComponent {
  readonly simpleGdi = EpidemiologicSimpleGdi.TEST

  readonly testPosData$: Observable<WeeklyReportDataPair<WeeklyReportPositivityRateGeographyCard>> =
    this.reportListItem$.pipe(switchMap((item) => this.dataService.loadWeeklyReportTestPositivityData(item)))
}
