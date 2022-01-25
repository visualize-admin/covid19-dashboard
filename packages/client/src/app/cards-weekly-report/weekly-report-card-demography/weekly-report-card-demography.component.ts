import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  isDefined,
  TimeSpan,
  WeeklyReportAgeBucketEntry,
  WeeklyReportEpidemiologicDemographyCard,
  WeeklyReportGenderBucketEntry,
} from '@c19/commons'
import { pascalCase } from 'change-case'
import { Observable } from 'rxjs'
import { map, mapTo, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { WeeklyReportDataPair } from '../../core/data/data.service'
import { RouteDataKey } from '../../routes/route-data-key.enum'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  DEFAULT_WEEKLY_REPORT_DEMO_VIEW_FILTER,
  getWeeklyDemoViewFilterOptions,
  WeeklyReportDemoViewFilter,
} from '../../shared/models/filters/weekly-report-demo-view-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { parseIsoDate } from '../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { CurrenWrValuesBase } from '../base-weekly-report-card.component'
import { ExtBaseWeeklyReportCardComponent } from '../ext-base-weekly-report-card.component'

export interface CurrentWrDemographyValues extends CurrenWrValuesBase {
  viewFilter: WeeklyReportDemoViewFilter
  timeFrame: TimeSpan
  ageData: WeeklyReportDataPair<WeeklyReportAgeBucketEntry[]>
  genderData: WeeklyReportDataPair<WeeklyReportGenderBucketEntry[]>
  noData: boolean
}

@Component({
  selector: 'bag-weekly-report-card-demography',
  templateUrl: './weekly-report-card-demography.component.html',
  styleUrls: ['./weekly-report-card-demography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportCardDemographyComponent
  extends ExtBaseWeeklyReportCardComponent<WeeklyReportEpidemiologicDemographyCard>
  implements OnInit
{
  readonly cardDetailPath = RoutePaths.SHARE_DEMOGRAPHY
  readonly cardKeyContext = `WeeklyReport.${pascalCase(
    this.route.snapshot.data[RouteDataKey.SIMPLE_GDI_OBJECT],
  )}.Card.Demography`

  readonly WeeklyReportDemoViewFilter = WeeklyReportDemoViewFilter

  readonly demoViewFilterOptions = getWeeklyDemoViewFilterOptions(DEFAULT_WEEKLY_REPORT_DEMO_VIEW_FILTER)
  readonly demoViewFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.DEMO_VIEW_FILTER] || null)
  readonly demoViewFilter$: Observable<WeeklyReportDemoViewFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEMO_VIEW_FILTER, DEFAULT_WEEKLY_REPORT_DEMO_VIEW_FILTER),
    tap<WeeklyReportDemoViewFilter>(
      emitValToOwnViewFn(this.demoViewFilterCtrl, DEFAULT_WEEKLY_REPORT_DEMO_VIEW_FILTER),
    ),
  )

  readonly currentValues$: Observable<CurrentWrDemographyValues> = this.demoViewFilter$.pipe(
    switchMap((viewFilter) => this.onChanges$.pipe(mapTo(viewFilter))),
    withLatestFrom(this.isoWeekFilter$),
    map(([viewFilter, isoWeek]): CurrentWrDemographyValues => {
      const { prev, curr } = this.data
      const timeFrame: TimeSpan = { start: prev.timeSpan.start, end: curr.timeSpan.end }
      const noGenderData = (data: WeeklyReportGenderBucketEntry[]) => !data.some((e) => isDefined(e.week))
      const noAgeData = (data: WeeklyReportAgeBucketEntry[]) => !data.some((e) => isDefined(e.week))
      return {
        viewFilter,
        isoWeek,
        prevWeekStart: parseIsoDate(prev.timeSpan.start),
        currWeekStart: parseIsoDate(curr.timeSpan.start),
        ageData: { prev: prev.ageData, curr: curr.ageData },
        genderData: { prev: prev.genderData, curr: curr.genderData },
        noData:
          noAgeData(prev.ageData) &&
          noAgeData(curr.ageData) &&
          noGenderData(prev.genderData) &&
          noGenderData(curr.genderData),
        timeFrame,
      }
    }),
    shareReplay(1),
  )

  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))

  demoKeys: Record<'noData', string>

  protected override init() {
    super.init()
    this.demoKeys = {
      noData: `${this.cardKeyContext}.NoData`,
    }
  }

  override ngOnInit() {
    super.ngOnInit()
    this.demoViewFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.DEMO_VIEW_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  override createDescription(args: { prevWeekStart: Date; currWeekStart: Date }): string {
    return this.createTestSpecificDescription(args)
  }
}
