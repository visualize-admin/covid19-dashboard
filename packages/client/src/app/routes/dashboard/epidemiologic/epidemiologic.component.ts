import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CantonGeoUnit,
  DEFAULT_GEO_UNIT,
  GdiObject,
  Language,
  ReDevelopmentValues,
  TimelineValues,
  TimeSpan,
  TopLevelGeoUnit,
} from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { combineLatest, Observable, Subject } from 'rxjs'
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators'
import { DataService, EpidemiologicMenuData } from '../../../core/data/data.service'
import { CURRENT_LANG } from '../../../core/i18n/language.token'
import { TranslatorService } from '../../../core/i18n/translator.service'
import { HistogramMenuLineEntry } from '../../../diagrams/histogram/histogram-menu/histogram-menu-line.component'
import { HistogramMenuEntry } from '../../../diagrams/histogram/histogram-menu/histogram-menu.component'
import { MasterDetailMenuItem } from '../../../shared/components/master-detail/master-detail-menu-item.type'
import { SearchFilterOptionGroup } from '../../../shared/components/search-filter/search-filter-options.type'
import {
  DEFAULT_TIME_SLOT_FILTER_DETAIL,
  DEFAULT_TIME_SLOT_FILTER_OVERVIEW,
  TimeSlotFilter,
  timeSlotFilterKey,
  timeSlotFilterTimeFrameKey,
} from '../../../shared/models/filters/time-slot-filter.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { parseIsoDate } from '../../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../../static-utils/update-query-param.function'
import { RoutePaths } from '../../route-paths.enum'

interface BaseDetailMenuItem extends MasterDetailMenuItem {
  type: 'histogram' | 'simple' | 'repro'
}

interface HistoDetailMenuItem extends BaseDetailMenuItem {
  type: 'histogram'
  histogramData: HistogramMenuEntry[]
  selectionStartDate: Date
}

interface SimpleDetailMenuItem extends BaseDetailMenuItem {
  type: 'simple'
}

interface ReproDetailMenuItem extends BaseDetailMenuItem {
  type: 'repro'
  histogramData: HistogramMenuLineEntry[] | null
}

type DetailMenuItem = HistoDetailMenuItem | SimpleDetailMenuItem | ReproDetailMenuItem

interface CurrentData {
  data: EpidemiologicMenuData
  timeFilter: TimeSlotFilter
  geoFilter: CantonGeoUnit | TopLevelGeoUnit
}

@Component({
  selector: 'bag-epidemiologic',
  templateUrl: './epidemiologic.component.html',
  styleUrls: ['./epidemiologic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpidemiologicComponent implements OnInit, OnDestroy {
  readonly detailGeoFilterGroups: SearchFilterOptionGroup[] = [
    {
      label: this.translator.get('Commons.Country'),
      options: getEnumValues(TopLevelGeoUnit)
        // handle default with null
        .map((value) => ({
          value: value === TopLevelGeoUnit.CHFL ? null : value,
          label: this.translator.get(`GeoFilter.${value}`),
        })),
    },
    {
      label: this.translator.get('Commons.Canton'),
      // sort alphabetically
      options: getEnumValues(CantonGeoUnit)
        .filter((v) => v !== CantonGeoUnit.FL)
        .map((value) => ({ value, label: this.translator.get(`GeoFilter.${value}`) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    },
  ]
  readonly timeFilterOptions: Array<{ labelKey: string; value: string | null }> = getEnumValues(TimeSlotFilter).map(
    (val) => ({
      labelKey: timeSlotFilterKey[<TimeSlotFilter>val],
      value: val === DEFAULT_TIME_SLOT_FILTER_OVERVIEW ? null : val,
    }),
  )

  readonly timeslotFilter$: Observable<TimeSlotFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.TIME_FILTER, DEFAULT_TIME_SLOT_FILTER_DETAIL),
  )
  readonly detailGeoFilterCtrl: FormControl
  readonly detailMenuItems$: Observable<DetailMenuItem[]>

  readonly geoFilter$: Observable<CantonGeoUnit | TopLevelGeoUnit> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER, DEFAULT_GEO_UNIT),
  )

  private readonly onDestroy = new Subject<void>()

  constructor(
    @Inject(CURRENT_LANG) readonly lang: Language,
    private readonly dataService: DataService,
    private readonly router: Router,
    private readonly translator: TranslatorService,
    private readonly route: ActivatedRoute,
  ) {
    this.detailGeoFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.GEO_FILTER] || null)

    this.detailMenuItems$ = combineLatest([this.timeslotFilter$, this.geoFilter$]).pipe(
      switchMap(([timeFilter, geoFilter]) => {
        return this.dataService
          .loadEpidemiologicMenuData(geoFilter)
          .then((data) => <CurrentData>{ data, timeFilter, geoFilter })
      }),
      map(this.prepareDetailMenuItems),
      shareReplay(1),
    )
  }

  ngOnInit() {
    this.detailGeoFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.GEO_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))

    // geoFilter might be changed from other controls, so we need to update this controls view
    this.geoFilter$
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => (v === DEFAULT_GEO_UNIT ? null : v)),
      )
      .subscribe(emitValToOwnViewFn(this.detailGeoFilterCtrl))
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  private prepareDetailMenuItems = ({ data, timeFilter, geoFilter }: CurrentData): DetailMenuItem[] => {
    const basePathArgs = ['/', this.lang, RoutePaths.DASHBOARD_EPIDEMIOLOGIC]

    const createTitle = (titleKey: string): string => {
      const title = this.translator.get(titleKey)
      return geoFilter === DEFAULT_GEO_UNIT ? title : `${title}, ${geoFilter}`
    }

    return [
      <HistoDetailMenuItem>{
        type: 'histogram',
        title: createTitle('Epidemiologic.Menu.Case.Title'),
        pathArgs: [...basePathArgs, RoutePaths.DASHBOARD_EPIDEMIOLOGIC_CASE],
        histogramData: this.getDetailMenuHistogramData(
          data[GdiObject.CASE].values,
          data[GdiObject.CASE].timeframes.tfTot,
        ),
        selectionStartDate: parseIsoDate(data[GdiObject.CASE].timeframes[timeSlotFilterTimeFrameKey[timeFilter]].start),
      },
      <HistoDetailMenuItem>{
        type: 'histogram',
        title: createTitle('Epidemiologic.Menu.Hosp.Title'),
        pathArgs: [...basePathArgs, RoutePaths.DASHBOARD_EPIDEMIOLOGIC_HOSP],
        histogramData: this.getDetailMenuHistogramData(
          data[GdiObject.HOSP].values,
          data[GdiObject.HOSP].timeframes.tfTot,
        ),
        selectionStartDate: parseIsoDate(data[GdiObject.HOSP].timeframes[timeSlotFilterTimeFrameKey[timeFilter]].start),
      },
      <HistoDetailMenuItem>{
        type: 'histogram',
        title: createTitle('Epidemiologic.Menu.Death.Title'),
        pathArgs: [...basePathArgs, RoutePaths.DASHBOARD_EPIDEMIOLOGIC_DEATH],
        histogramData: this.getDetailMenuHistogramData(
          data[GdiObject.DEATH].values,
          data[GdiObject.DEATH].timeframes.tfTot,
        ),
        selectionStartDate: parseIsoDate(
          data[GdiObject.DEATH].timeframes[timeSlotFilterTimeFrameKey[timeFilter]].start,
        ),
      },
      <HistoDetailMenuItem>{
        type: 'histogram',
        title: createTitle('Epidemiologic.Menu.Test.Title'),
        pathArgs: [...basePathArgs, RoutePaths.DASHBOARD_EPIDEMIOLOGIC_TEST],
        histogramData: this.getDetailMenuHistogramData(
          data[GdiObject.TEST].values,
          data[GdiObject.TEST].timeframes.tfTot,
        ),
        selectionStartDate: parseIsoDate(data[GdiObject.TEST].timeframes[timeSlotFilterTimeFrameKey[timeFilter]].start),
      },
      <ReproDetailMenuItem>{
        type: 'repro',
        style: 'default',
        title: createTitle('Epidemiologic.Menu.Reproduction.Title'),
        pathArgs: [...basePathArgs, RoutePaths.DASHBOARD_EPIDEMIOLOGIC_REPRO],
        histogramData: data.CovidRe
          ? this.getDetailMenuReproData(data.CovidRe.values, data.CovidRe.timeframes.tfTot)
          : null,
      },
      <SimpleDetailMenuItem>{
        type: 'simple',
        title: createTitle('Epidemiologic.Menu.VirusVariants.Title'),
        pathArgs: [...basePathArgs, RoutePaths.DASHBOARD_EPIDEMIOLOGIC_VIRUS_VARIANTS],
        facet: 'slim',
      },
    ]
  }

  private getDetailMenuHistogramData(
    timelineData: TimelineValues<'value'>[],
    timeSpan: TimeSpan,
  ): HistogramMenuEntry[] {
    return timelineData
      .filter((i) => i.date >= timeSpan.start && i.date <= timeSpan.end)
      .map((i) => ({ date: parseIsoDate(i.date), value: i.value }))
  }

  private getDetailMenuReproData(
    timelineData: TimelineValues<ReDevelopmentValues>[],
    timeSpan: TimeSpan,
  ): HistogramMenuLineEntry[] {
    return timelineData
      .filter((i) => i.date >= timeSpan.start && i.date <= timeSpan.end)
      .map((i) => ({ date: parseIsoDate(i.date), value: i.median_r_mean }))
  }
}
