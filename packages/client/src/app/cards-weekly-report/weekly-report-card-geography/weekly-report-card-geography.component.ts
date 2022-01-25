import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { isDefined, TopLevelGeoUnit, WeeklyReportEpidemiologicGeographyCard } from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { pascalCase } from 'change-case'
import { combineLatest, Observable } from 'rxjs'
import { map, mapTo, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { ExtendedGeoFeatureCollection } from '../../diagrams/choropleth/base-choropleth.component'
import { RouteDataKey } from '../../routes/route-data-key.enum'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  DEFAULT_WEEKLY_REPORT_GEO_VIEW_FILTER,
  getWeeklyReportGeoViewFilterOptions,
  WeeklyReportGeoViewFilter,
} from '../../shared/models/filters/weekly-report-geo-view-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { parseIsoDate } from '../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { CurrenWrValuesBase } from '../base-weekly-report-card.component'
import { ExtBaseWeeklyReportCardComponent } from '../ext-base-weekly-report-card.component'

export interface CurrentWrGeoValues extends CurrenWrValuesBase {
  viewFilter: WeeklyReportGeoViewFilter
  prevWeek: WeeklyReportEpidemiologicGeographyCard
  currWeek: WeeklyReportEpidemiologicGeographyCard
  noCantonData: boolean
}

interface WeeklyReportInfoBoxEntry {
  date: Date
  abs: number | null
  inz: number | null
}

interface WeeklyReportInfoBoxData {
  total: WeeklyReportInfoBoxEntry
  prevWeek: WeeklyReportInfoBoxEntry
  currWeek: WeeklyReportInfoBoxEntry
  diff: number | null
}

@Component({
  selector: 'bag-weekly-report-card-geography',
  templateUrl: './weekly-report-card-geography.component.html',
  styleUrls: ['./weekly-report-card-geography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportCardGeographyComponent
  extends ExtBaseWeeklyReportCardComponent<WeeklyReportEpidemiologicGeographyCard>
  implements OnInit
{
  @Input()
  cantonGeoJson: ExtendedGeoFeatureCollection

  @Input()
  grGeoJson: ExtendedGeoFeatureCollection

  readonly WeeklyReportGeoViewFilter = WeeklyReportGeoViewFilter
  readonly cardDetailPath = RoutePaths.SHARE_GEOGRAPHY
  readonly cardKeyContext = `WeeklyReport.${pascalCase(
    this.route.snapshot.data[RouteDataKey.SIMPLE_GDI_OBJECT],
  )}.Card.Geography`

  readonly geoViewFilterOptions = getWeeklyReportGeoViewFilterOptions(DEFAULT_WEEKLY_REPORT_GEO_VIEW_FILTER)
  readonly geoViewFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.GEO_VIEW_FILTER] || null)
  readonly geoViewFilter$: Observable<WeeklyReportGeoViewFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_VIEW_FILTER, DEFAULT_WEEKLY_REPORT_GEO_VIEW_FILTER),
    tap<WeeklyReportGeoViewFilter>(emitValToOwnViewFn(this.geoViewFilterCtrl, DEFAULT_WEEKLY_REPORT_GEO_VIEW_FILTER)),
  )

  readonly currentValues$: Observable<CurrentWrGeoValues> = combineLatest([
    this.regionsFilter$,
    this.geoViewFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.isoWeekFilter$),
    map(([[regionsFilter, viewFilter], isoWeek]) => {
      const { prev, curr } = this.data
      return {
        prevWeekStart: parseIsoDate(prev.timeSpan.start),
        currWeekStart: parseIsoDate(curr.timeSpan.start),
        prevWeek: prev,
        currWeek: curr,
        noCantonData: this.hasNoCantonData(prev) && this.hasNoCantonData(curr),
        viewFilter,
        isoWeek,
        regionsFilter,
      }
    }),
    shareReplay(1),
  )

  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))

  readonly infoBoxData$: Observable<WeeklyReportInfoBoxData> = this.currentValues$.pipe(
    map(this.prepareInfoBoxData.bind(this)),
  )

  geoKeys: Record<'noCantonData', string>

  override ngOnInit() {
    super.ngOnInit()
    this.geoViewFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.GEO_VIEW_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  override createDescription(args: { prevWeekStart: Date; currWeekStart: Date }): string {
    return this.createTestSpecificDescription(args)
  }

  private prepareInfoBoxData(): WeeklyReportInfoBoxData {
    const curr = this.data.curr
    const prev = this.data.prev
    return {
      total: {
        abs: curr.geoUnitData[TopLevelGeoUnit.CHFL].total,
        inz: curr.geoUnitData[TopLevelGeoUnit.CHFL].inzTotal,
        date: parseIsoDate(curr.timeSpan.end),
      },
      prevWeek: {
        abs: prev.geoUnitData[TopLevelGeoUnit.CHFL].week,
        inz: prev.geoUnitData[TopLevelGeoUnit.CHFL].inzWeek,
        date: parseIsoDate(prev.timeSpan.start),
      },
      currWeek: {
        abs: curr.geoUnitData[TopLevelGeoUnit.CHFL].week,
        inz: curr.geoUnitData[TopLevelGeoUnit.CHFL].inzWeek,
        date: parseIsoDate(curr.timeSpan.start),
      },
      diff: curr.geoUnitData[TopLevelGeoUnit.CHFL].diffWeekPercentage,
    }
  }

  private hasNoCantonData(data: WeeklyReportEpidemiologicGeographyCard): boolean {
    const tlGeoUnits = getEnumValues(TopLevelGeoUnit)
    return !Object.entries(data.geoUnitData)
      .filter(([key]) => !tlGeoUnits.includes(key))
      .map(([_, val]) => val)
      .some((e) => isDefined(e.week))
  }

  protected override init() {
    super.init()
    this.geoKeys = {
      noCantonData: `${this.cardKeyContext}.NoCantonData`,
    }
  }
}
