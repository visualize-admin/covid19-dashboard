import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { Language, WeeklyReportWeekList } from '@c19/commons'
import { getISOWeek } from 'date-fns'
import { Observable, of, Subject } from 'rxjs'
import { map, takeUntil } from 'rxjs/operators'
import { DataService } from '../../../core/data/data.service'
import { CURRENT_LANG } from '../../../core/i18n/language.token'
import { TranslatorService } from '../../../core/i18n/translator.service'
import { MasterDetailMenuItem } from '../../../shared/components/master-detail/master-detail-menu-item.type'
import { SearchFilterOptionGroup } from '../../../shared/components/search-filter/search-filter-options.type'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { formatUtcDate, parseIsoDate } from '../../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../../static-utils/update-query-param.function'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'

@Component({
  selector: 'bag-weekly-report',
  templateUrl: './weekly-report.component.html',
  styleUrls: ['./weekly-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportComponent implements OnInit, OnDestroy {
  readonly reportList: WeeklyReportWeekList = this.route.snapshot.data[RouteDataKey.WEEKLY_REPORT_LIST]

  readonly detailWeekFilterGroups: SearchFilterOptionGroup[] = [
    {
      label: this.translator.get('WeeklyReport.Filter.GroupLabel'),
      options: this.reportList.availableWeeks.map((e, ix) => {
        const startDate = parseIsoDate(e.current.timeSpan.start)
        return {
          value: ix === 0 ? null : e.current.isoWeek,
          label: this.translator.get('WeeklyReport.Filter.Title.Value', {
            week: getISOWeek(startDate),
            date: formatUtcDate(startDate, 'dd.MM.yyyy'),
          }),
        }
      }),
    },
  ]
  readonly detailWeekFilterCtrl = new FormControl(
    parseInt(this.route.snapshot.queryParams[QueryParams.ISO_WEEK_FILTER], 10) || null,
  )
  readonly detailMenuItems$: Observable<MasterDetailMenuItem[]> = of(this.createMenuItems())

  readonly showGlobalDisclaimer$: Observable<boolean>

  get dataStatusArgs() {
    const sourceDate = new Date(this.reportList.sourceDate)
    return {
      date: formatUtcDate(sourceDate),
      timeHH: formatUtcDate(sourceDate, 'HH'),
      timeMM: formatUtcDate(sourceDate, 'mm'),
    }
  }

  private readonly onDestroy = new Subject<void>()

  constructor(
    @Inject(CURRENT_LANG) readonly lang: Language,
    private readonly translator: TranslatorService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    dataService: DataService,
  ) {
    this.showGlobalDisclaimer$ = dataService.sourceDate$.pipe(
      map((sourceDate) => {
        const startDate = parseIsoDate('2021-12-20')
        const endDate = parseIsoDate('2022-01-13')
        return !!this.translator.tryGet('WeeklyReport.Disclaimer') && sourceDate >= startDate && sourceDate < endDate
      }),
    )
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(
        takeUntil(this.onDestroy),
        selectChanged(QueryParams.ISO_WEEK_FILTER),
        map((v) => parseInt(v, 10) || null),
      )
      .subscribe(emitValToOwnViewFn(this.detailWeekFilterCtrl))

    this.detailWeekFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.ISO_WEEK_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  private createMenuItems(): MasterDetailMenuItem[] {
    const basePath: string[] = ['/', this.lang, RoutePaths.DASHBOARD_WEEKLY_REPORT]
    return [
      {
        title: this.translator.get('WeeklyReport.Menu.Situation.Title'),
        pathArgs: [...basePath, RoutePaths.DASHBOARD_WEEKLY_REPORT_SITUATION],
      },
      {
        title: this.translator.get('WeeklyReport.Menu.Case.Title'),
        pathArgs: [...basePath, RoutePaths.DASHBOARD_WEEKLY_REPORT_CASE],
      },
      {
        title: this.translator.get('WeeklyReport.Menu.Hosp.Title'),
        pathArgs: [...basePath, RoutePaths.DASHBOARD_WEEKLY_REPORT_HOSP],
      },
      {
        title: this.translator.get('WeeklyReport.Menu.Death.Title'),
        pathArgs: [...basePath, RoutePaths.DASHBOARD_WEEKLY_REPORT_DEATH],
      },
      {
        title: this.translator.get('WeeklyReport.Menu.Test.Title'),
        pathArgs: [...basePath, RoutePaths.DASHBOARD_WEEKLY_REPORT_TEST],
      },
      {
        title: this.translator.get('WeeklyReport.Menu.HospCapacityIcu.Title'),
        pathArgs: [...basePath, RoutePaths.DASHBOARD_WEEKLY_REPORT_HOSP_CAPACITY_ICU],
      },
      {
        title: this.translator.get('WeeklyReport.Menu.MethodsAndSources.Title'),
        pathArgs: [...basePath, RoutePaths.DASHBOARD_WEEKLY_REPORT_METHODS_AND_SOURCES],
      },
    ]
  }
}
