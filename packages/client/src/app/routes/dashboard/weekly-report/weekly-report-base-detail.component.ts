import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import {
  EpidemiologicSimpleGdi,
  isDefined,
  WeeklyReportEpidemiologicDemographyCard,
  WeeklyReportEpidemiologicGeographyCard,
  WeeklyReportEpidemiologicSummaryCard,
  WeeklyReportListItem,
  WeeklyReportWeekList,
} from '@c19/commons'
import { getISOWeek } from 'date-fns'
import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { DataService, WeeklyReportDataPair } from '../../../core/data/data.service'
import { TranslatorService } from '../../../core/i18n/translator.service'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { DEFAULT_REGIONS_FILTER, RegionsFilter } from '../../../shared/models/filters/regions-filter.enum'
import { formatUtcDate, parseIsoDate } from '../../../static-utils/date-utils'
import { pascalCase } from 'change-case'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { RouteDataKey } from '../../route-data-key.enum'

@Component({ template: '' })
export abstract class WeeklyReportBaseDetailComponent {
  abstract readonly simpleGdi: EpidemiologicSimpleGdi

  // tslint:disable-next-line:no-non-null-assertion
  readonly chflGeoJson = this.route.parent!.snapshot.data[RouteDataKey.GEO_JSON]
  // tslint:disable-next-line:no-non-null-assertion
  readonly chflGrGeoJson = this.route.parent!.snapshot.data[RouteDataKey.GEO_JSON_2]

  readonly weeklyReportWeekList: WeeklyReportWeekList =
    // tslint:disable-next-line:no-non-null-assertion
    this.route.parent!.snapshot.data[RouteDataKey.WEEKLY_REPORT_LIST]

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

  readonly titleDesc$: Observable<string> = this.reportListItem$.pipe(
    map(({ current, previous }) => {
      return this.translator.get(`WeeklyReport.${pascalCase(this.simpleGdi)}.DetailIntro`, {
        prevDate: formatUtcDate(parseIsoDate(previous.timeSpan.start)),
        prevWeek: getISOWeek(parseIsoDate(previous.timeSpan.start)),
        currDate: formatUtcDate(parseIsoDate(current.timeSpan.start)),
        currWeek: getISOWeek(parseIsoDate(current.timeSpan.start)),
      })
    }),
  )

  protected readonly regionFilter$: Observable<RegionsFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.REGIONS_FILTER, DEFAULT_REGIONS_FILTER),
  )

  readonly summaryData$: Observable<WeeklyReportDataPair<WeeklyReportEpidemiologicSummaryCard>> =
    this.reportListItem$.pipe(
      switchMap((item) => this.dataService.loadWeeklyReportEpidemiologicSummaryData(this.simpleGdi, item)),
    )

  readonly geoData$: Observable<WeeklyReportDataPair<WeeklyReportEpidemiologicGeographyCard>> =
    this.reportListItem$.pipe(switchMap((item) => this.dataService.loadWeeklyReportGeographyData(this.simpleGdi, item)))

  readonly demData$: Observable<WeeklyReportDataPair<WeeklyReportEpidemiologicDemographyCard>> =
    this.reportListItem$.pipe(
      switchMap((item) => this.dataService.loadWeeklyReportDemographyData(this.simpleGdi, item)),
    )

  constructor(
    protected readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly dataService: DataService,
    protected readonly translator: TranslatorService,
  ) {}
}
