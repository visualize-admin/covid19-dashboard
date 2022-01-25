import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  GdiObject,
  GdiSubset,
  TopLevelGeoUnit,
  WeeklyInlineValues,
  WeeklySitutationReportOverviewCard,
} from '@c19/commons'
import { getISOWeek } from 'date-fns'
import { combineLatest, Observable } from 'rxjs'
import { map, mapTo, switchMap, takeUntil, tap } from 'rxjs/operators'
import { RoutePaths } from '../../routes/route-paths.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { RelativityFilter, getRelativityFilterOptions } from '../../shared/models/filters/relativity-filter.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { BaseWeeklyReportCardComponent, CurrenWrValuesBase } from '../base-weekly-report-card.component'

interface TableDataEntry {
  label: string
  total: string
  prevWeek: string
  currWeek: string
  diff: string
  inlineEntries: Array<Omit<TableDataEntry, 'inlineEntries'>>
}

interface TableTitleWeekDate {
  week: number
  date: string
}

interface TableData {
  total: string
  prevWeek: TableTitleWeekDate
  currWeek: TableTitleWeekDate
  entries: TableDataEntry[]
}

interface CurrentValues extends CurrenWrValuesBase {
  isInz: boolean
}

@Component({
  selector: 'bag-weekly-report-card-overview',
  templateUrl: './weekly-report-card-overview.component.html',
  styleUrls: ['./weekly-report-card-overview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportCardOverviewComponent
  extends BaseWeeklyReportCardComponent<WeeklySitutationReportOverviewCard>
  implements OnInit
{
  readonly cardDetailPath = RoutePaths.SHARE_OVERVIEW
  readonly cardKeyContext = `WeeklyReport.Card.Overview`

  readonly relativityFilterOptions = getRelativityFilterOptions(RelativityFilter.ABSOLUTE)
  readonly relativityFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.REL_ABS_FILTER] || null)
  readonly relativityFilter$: Observable<RelativityFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.REL_ABS_FILTER, RelativityFilter.ABSOLUTE),
    tap<RelativityFilter>(emitValToOwnViewFn(this.relativityFilterCtrl, RelativityFilter.ABSOLUTE)),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.isoWeekFilter$,
    this.relativityFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    map(([isoWeek, rel]) => {
      return {
        isoWeek,
        currWeekStart: parseIsoDate(this.data.curr.timeSpan.start),
        prevWeekStart: parseIsoDate(this.data.prev.timeSpan.start),
        isInz: rel === RelativityFilter.INZ_100K,
      }
    }),
  )

  readonly tableData$ = this.currentValues$.pipe(map(this.createTableData.bind(this)))

  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))

  ngOnInit() {
    this.relativityFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.REL_ABS_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  createDescription({ currWeekStart }: CurrentValues): string {
    return this.translator.get(`${this.cardKeyContext}.Description`, {
      currWeek: getISOWeek(currWeekStart),
      currDate: formatUtcDate(currWeekStart),
    })
  }

  private createTableData(cv: CurrentValues): TableData {
    return {
      total: formatUtcDate(parseIsoDate(this.data.curr.timeSpan.end)),
      prevWeek: {
        date: formatUtcDate(parseIsoDate(this.data.prev.timeSpan.start)),
        week: getISOWeek(parseIsoDate(this.data.prev.timeSpan.start)),
      },
      currWeek: {
        date: formatUtcDate(parseIsoDate(this.data.curr.timeSpan.start)),
        week: getISOWeek(parseIsoDate(this.data.curr.timeSpan.start)),
      },
      entries: [
        this.createTableEntry(cv.isInz, GdiObject.CASE),
        this.createTableEntry(cv.isInz, GdiObject.HOSP),
        this.createTableEntry(cv.isInz, GdiObject.DEATH),
        this.createTableEntry(cv.isInz, GdiObject.TEST),
      ],
    }
  }

  private createTableEntry(isInz: boolean, gdiObject: GdiObject): TableDataEntry {
    switch (gdiObject) {
      case GdiObject.CASE:
      case GdiObject.HOSP:
      case GdiObject.DEATH:
        return {
          ...this.createInlineEntry(
            `${this.cardKeyContext}.Table.${gdiObject.split('Covid')[1]}`,
            isInz,
            this.data.curr.chFlData[gdiObject],
            this.data.prev.chFlData[gdiObject],
          ),
          inlineEntries: [
            this.createInlineEntry(
              `GeoFilter.${TopLevelGeoUnit.CH}`,
              isInz,
              this.data.curr.chData[gdiObject],
              this.data.prev.chData[gdiObject],
            ),
            this.createInlineEntry(
              `GeoFilter.${TopLevelGeoUnit.FL}`,
              isInz,
              this.data.curr.flData[gdiObject],
              this.data.prev.flData[gdiObject],
            ),
          ],
        }
      case GdiObject.TEST:
        const label = `${this.cardKeyContext}.Table.${gdiObject.split('Covid')[1]}`
        const currTestPcr = this.data.curr.chFlData[gdiObject][GdiSubset.TEST_PCR]
        const prevTestPcr = this.data.prev.chFlData[gdiObject][GdiSubset.TEST_PCR]
        const currTestAntigen = this.data.curr.chFlData[gdiObject][GdiSubset.TEST_ANTIGEN]
        const prevTestAntigen = this.data.prev.chFlData[gdiObject][GdiSubset.TEST_ANTIGEN]
        return {
          ...this.createInlineEntry(
            label,
            isInz,
            this.data.curr.chFlData[gdiObject][GdiSubset.TEST_ALL],
            this.data.prev.chFlData[gdiObject][GdiSubset.TEST_ALL],
          ),
          inlineEntries: [
            this.createInlineEntry(`${label}.PCR`, isInz, currTestPcr, prevTestPcr),
            this.createInlineEntry(`${label}.Antigen`, isInz, currTestAntigen, prevTestAntigen),
            this.createInlineEntryPositivityRate(
              `${this.cardKeyContext}.Table.PositivityRate.PCR`,
              prevTestPcr,
              currTestPcr,
            ),
            this.createInlineEntryPositivityRate(
              `${this.cardKeyContext}.Table.PositivityRate.Antigen`,
              prevTestAntigen,
              currTestAntigen,
            ),
          ],
        }
      default:
        throw new Error(`${gdiObject} Data not supported for WeeklyReportCardOverview`)
    }
  }

  private createInlineEntry(
    label: string,
    isInz: boolean,
    curr: WeeklyInlineValues,
    prev: WeeklyInlineValues,
  ): Omit<TableDataEntry, 'inlineEntries'> {
    return {
      label,
      total: isInz ? adminFormatNum(curr.inzTotal, 2) : adminFormatNum(curr.total),
      prevWeek: isInz ? adminFormatNum(prev.inzWeek, 2) : adminFormatNum(prev.week),
      currWeek: isInz ? adminFormatNum(curr.inzWeek, 2) : adminFormatNum(curr.week),
      diff: `${curr.diffWeekPercentage && curr.diffWeekPercentage > 0 ? '+' : ''}${adminFormatNum(
        curr.diffWeekPercentage,
        1,
        '%',
      )}`,
    }
  }

  private createInlineEntryPositivityRate(
    label: string,
    prev: WeeklyInlineValues,
    curr: WeeklyInlineValues,
  ): Omit<TableDataEntry, 'inlineEntries'> {
    return {
      label,
      total: adminFormatNum(curr.percentageTotal_posTest, 1, '%'),
      prevWeek: adminFormatNum(prev.percentageWeek_posTest, 1, '%'),
      currWeek: adminFormatNum(curr.percentageWeek_posTest, 1, '%'),
      diff: `${curr.diffPpPercentageWeek_posTest && curr.diffPpPercentageWeek_posTest > 0 ? '+' : ''}${adminFormatNum(
        curr.diffPpPercentageWeek_posTest,
        1,
        'pp',
      )}`,
    }
  }
}
