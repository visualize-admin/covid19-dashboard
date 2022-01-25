import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import {
  isDefined,
  WeeklyReportListItem,
  WeeklyReportWeekList,
  WeeklySituationReportDevelopmentCard,
  WeeklySituationReportSummaryCard,
  WeeklySitutationReportOverviewCard,
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
  selector: 'bag-weekly-report-case',
  templateUrl: './weekly-report-situation.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportSituationComponent {
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

  readonly summaryData$: Observable<WeeklyReportDataPair<WeeklySituationReportSummaryCard>> = this.reportListItem$.pipe(
    switchMap((reportItem) => this.dataService.loadWeeklyReportSummaryData(reportItem)),
  )

  readonly overviewData$: Observable<WeeklyReportDataPair<WeeklySitutationReportOverviewCard>> =
    this.reportListItem$.pipe(switchMap((reportItem) => this.dataService.loadWeeklyReportOverviewData(reportItem)))

  readonly developmentData$: Observable<WeeklyReportDataPair<WeeklySituationReportDevelopmentCard>> =
    this.reportListItem$.pipe(switchMap(() => this.dataService.loadWeeklyReportDevelopmentData())).pipe(
      map((res) => {
        return {
          curr: res,
          prev: res,
        }
      }),
    )

  readonly titleDesc$: Observable<string> = this.reportListItem$.pipe(
    map(({ current }) => {
      return this.translator.get(`WeeklyReport.Situation.DetailDescription`, {
        currWeek: getISOWeek(parseIsoDate(current.timeSpan.start)),
        currDate: formatUtcDate(parseIsoDate(current.timeSpan.start)),
      })
    }),
  )

  constructor(
    private readonly dataService: DataService,
    private readonly translator: TranslatorService,
    private readonly route: ActivatedRoute,
  ) {}
}
