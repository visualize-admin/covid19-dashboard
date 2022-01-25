import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  GdiSubset,
  isDefined,
  TopLevelGeoUnit,
  WeeklyReportPositivityRateGeographyCard,
  WeeklyReportPositivityRateGeoUnitData,
} from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { getISOWeek } from 'date-fns'
import { combineLatest, Observable } from 'rxjs'
import { map, mapTo, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  DEFAULT_WEEKLY_REPORT_TEST_POSITIVITY_VIEW_FILTER,
  getWeeklyReportTestPositivityViewFilterOptions,
  WeeklyReportTestPositivityViewFilter,
} from '../../shared/models/filters/weekly-report-testpos-view-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { CurrenWrValuesBase } from '../base-weekly-report-card.component'
import { ExtBaseWeeklyReportCardComponent } from '../ext-base-weekly-report-card.component'

export interface CurrentWrTestPosValues extends CurrenWrValuesBase {
  viewFilter: WeeklyReportTestPositivityViewFilter
  prevWeek: WeeklyReportPositivityRateGeographyCard
  currWeek: WeeklyReportPositivityRateGeographyCard
  noCantonData: boolean
}

interface BoxInfoRow {
  pcr: number | null
  antigen: number | null
  date: Date
}

interface BoxInfo {
  total: BoxInfoRow
  prev: BoxInfoRow
  curr: BoxInfoRow
  diff: BoxInfoRow
}

@Component({
  selector: 'bag-weekly-report-card-test-positivity',
  templateUrl: './weekly-report-card-test-positivity.component.html',
  styleUrls: ['./weekly-report-card-test-positivity.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportCardTestPositivityComponent
  extends ExtBaseWeeklyReportCardComponent<WeeklyReportPositivityRateGeographyCard>
  implements OnInit
{
  protected readonly cardKeyContext = `WeeklyReport.Test.Card.TestPositivity`
  protected readonly cardDetailPath = RoutePaths.SHARE_TEST_POSITIVITY

  readonly WeeklyReportTestPositivityViewFilter = WeeklyReportTestPositivityViewFilter

  readonly testPosViewFilterOptions = getWeeklyReportTestPositivityViewFilterOptions(
    DEFAULT_WEEKLY_REPORT_TEST_POSITIVITY_VIEW_FILTER,
  )
  readonly testPosViewFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.TEST_POS_VIEW_FILTER] || null,
  )
  readonly testPosViewFilter$: Observable<WeeklyReportTestPositivityViewFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.TEST_POS_VIEW_FILTER, DEFAULT_WEEKLY_REPORT_TEST_POSITIVITY_VIEW_FILTER),
    tap<WeeklyReportTestPositivityViewFilter>(
      emitValToOwnViewFn(this.testPosViewFilterCtrl, DEFAULT_WEEKLY_REPORT_TEST_POSITIVITY_VIEW_FILTER),
    ),
  )

  readonly currentValues$: Observable<CurrentWrTestPosValues> = combineLatest([
    this.regionsFilter$,
    this.testPosViewFilter$,
  ]).pipe(
    switchMap((arg) => this.onChanges$.pipe(mapTo(arg))),
    withLatestFrom(this.isoWeekFilter$),
    map(([[regionsFilter, viewFilter], isoWeek]) => {
      const { prev, curr } = this.data
      return {
        viewFilter,
        prevWeekStart: parseIsoDate(prev.timeSpan.start),
        currWeekStart: parseIsoDate(curr.timeSpan.start),
        prevWeek: prev,
        currWeek: curr,
        noCantonData: this.hasNoCantonData(prev.geoUnitData) && this.hasNoCantonData(curr.geoUnitData),
        isoWeek,
        regionsFilter,
      }
    }),
    shareReplay(1),
  )
  readonly boxInfo$: Observable<BoxInfo> = this.currentValues$.pipe(map(this.prepareBoxInfo.bind(this)))
  readonly description$: Observable<string> = this.currentValues$.pipe(map(this.createDescription.bind(this)))

  override ngOnInit() {
    super.ngOnInit()
    this.testPosViewFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.TEST_POS_VIEW_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  override createDescription(args: { prevWeekStart: Date; currWeekStart: Date }): string {
    const topic = this.translator.get('WeeklyReport.Card.TestPositivity.Title')
    return this.translator.get('WeeklyReport.Card.Description', {
      topic,
      prevDate: formatUtcDate(args.prevWeekStart),
      prevWeek: getISOWeek(args.prevWeekStart),
      currDate: formatUtcDate(args.currWeekStart),
      currWeek: getISOWeek(args.currWeekStart),
    })
  }

  private prepareBoxInfo(cv: CurrentWrTestPosValues): BoxInfo {
    const prev = cv.prevWeek.geoUnitData[TopLevelGeoUnit.CHFL]
    const curr = cv.currWeek.geoUnitData[TopLevelGeoUnit.CHFL]
    return {
      total: {
        date: parseIsoDate(cv.currWeek.timeSpan.end),
        pcr: curr[GdiSubset.TEST_PCR].percentageTotal_posTest,
        antigen: curr[GdiSubset.TEST_ANTIGEN].percentageTotal_posTest,
      },
      prev: {
        date: cv.prevWeekStart,
        pcr: prev[GdiSubset.TEST_PCR].percentageWeek_posTest,
        antigen: prev[GdiSubset.TEST_ANTIGEN].percentageWeek_posTest,
      },
      curr: {
        date: cv.currWeekStart,
        pcr: curr[GdiSubset.TEST_PCR].percentageWeek_posTest,
        antigen: curr[GdiSubset.TEST_ANTIGEN].percentageWeek_posTest,
      },
      diff: {
        date: cv.prevWeekStart,
        pcr: curr[GdiSubset.TEST_PCR].diffPpPercentageWeek_posTest,
        antigen: curr[GdiSubset.TEST_ANTIGEN].diffPpPercentageWeek_posTest,
      },
    }
  }

  private hasNoCantonData(data: WeeklyReportPositivityRateGeoUnitData): boolean {
    const tlGeoUnits = getEnumValues(TopLevelGeoUnit)
    return !Object.entries(data)
      .filter(([key]) => !tlGeoUnits.includes(key))
      .map(([_, val]) => val)
      .some(
        (e) =>
          isDefined(e[GdiSubset.TEST_PCR].percentageWeek_posTest) ||
          isDefined(e[GdiSubset.TEST_ANTIGEN].percentageWeek_posTest),
      )
  }
}
