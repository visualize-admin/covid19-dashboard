import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import {
  isDefined,
  WeeklyReportHospCapacityDataCard,
  WeeklyReportHospCapacitySummaryCard,
  WeeklyReportListItem,
  WeeklyReportWeekList,
} from '@c19/commons'
import { getISOWeek } from 'date-fns'
import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { DataService, WeeklyReportDataPair } from '../../../../core/data/data.service'
import { TranslatorService } from '../../../../core/i18n/translator.service'
import { QueryParams } from '../../../../shared/models/query-params.enum'
import { formatUtcDate, parseIsoDate } from '../../../../static-utils/date-utils'
import { selectChanged } from '../../../../static-utils/select-changed.operator'
import { RouteDataKey } from '../../../route-data-key.enum'

@Component({
  selector: 'bag-weekly-report-hosp-cap-icu',
  templateUrl: './weekly-report-hosp-capacity-icu.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportHospCapacityIcuComponent {
  protected readonly weekFilter$: Observable<number> = this.route.queryParams.pipe(
    selectChanged(QueryParams.ISO_WEEK_FILTER),
    map((v) => (isDefined(v) ? parseInt(v, 10) : this.weeklyReportWeekList.latest.current.isoWeek)),
  )

  protected readonly reportListItem$: Observable<WeeklyReportListItem> = this.weekFilter$.pipe(
    map((isoWeek) => {
      // tslint:disable-next-line:no-non-null-assertion
      return this.weeklyReportWeekList.availableWeeks.find(({ current }) => current.isoWeek === isoWeek)!
    }),
  )
  readonly weeklyReportWeekList: WeeklyReportWeekList =
    // tslint:disable-next-line:no-non-null-assertion
    this.route.parent!.snapshot.data[RouteDataKey.WEEKLY_REPORT_LIST]

  readonly titleDesc$: Observable<string> = this.reportListItem$.pipe(
    map(({ current, previous }) => {
      return this.translator.get(`WeeklyReport.HospCapacityIcu.DetailIntro`, {
        prevDate: formatUtcDate(parseIsoDate(previous.timeSpan.start)),
        prevWeek: getISOWeek(parseIsoDate(previous.timeSpan.start)),
        currDate: formatUtcDate(parseIsoDate(current.timeSpan.start)),
        currWeek: getISOWeek(parseIsoDate(current.timeSpan.start)),
      })
    }),
  )

  readonly summaryData$: Observable<WeeklyReportDataPair<WeeklyReportHospCapacitySummaryCard>> =
    this.reportListItem$.pipe(
      switchMap((reportItem) => this.dataService.loadWeeklyReportHospCapacityIcuSummary(reportItem)),
    )

  readonly hospCapacityData$: Observable<WeeklyReportDataPair<WeeklyReportHospCapacityDataCard>> =
    this.reportListItem$.pipe(
      switchMap((reportItem) => this.dataService.loadWeeklyReportHospCapacityIcuData(reportItem)),
    )

  constructor(
    protected readonly dataService: DataService,
    protected readonly translator: TranslatorService,
    private readonly route: ActivatedRoute,
  ) {}
}
