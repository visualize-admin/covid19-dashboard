import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Params, Router } from '@angular/router'
import {
  CantonGeoUnitNumber,
  ExtraGeoUnitDataByPeriod,
  ExtraGeoUnitDataEntry,
  ExtraGeoUnitDataEntryValue,
  ExtraGeoUnitsData,
  isDefined,
} from '@c19/commons'
import { WindowRef } from '@shiftcode/ngx-core'
import { getEnumKeyFromValue } from '@shiftcode/utilities'
import { isAfter, isWithinInterval } from 'date-fns'
import { BehaviorSubject, combineLatest, fromEvent, interval, Observable, PartialObserver, Subject } from 'rxjs'
import {
  debounceTime,
  filter,
  first,
  map,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators'
import { TranslatorService } from '../../core/i18n/translator.service'
import { UriService } from '../../core/uri.service'
import { ChoroplethCanvasComponent } from '../../diagrams/choropleth-canvas/choropleth-canvas.component'
import {
  ChoroplethGeoFeature,
  ChoroplethGeoFeatureCollection,
  ExtendedGeoFeatureCollection,
} from '../../diagrams/choropleth/base-choropleth.component'
import { HeatmapRowComponent, HeatmapRowEntry } from '../../diagrams/heatmap-row/heatmap-row.component'
import { RouteDataKey } from '../../routes/route-data-key.enum'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLORS_INZ_SUM_CAT } from '../../shared/commons/colors.const'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import {
  DEFAULT_GEO_LEVEL_FILTER,
  GeoLevelFilter,
  getGeoLevelFilterOptions,
} from '../../shared/models/filters/geo-level-filter.enum'
import { MatrixParams } from '../../shared/models/matrix-params.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { ImageDownloadUrls } from '../base-detail-epidemiologic-card.component'

interface CurrentValues {
  geoLevelFilter: GeoLevelFilter
  geoJson: ExtendedGeoFeatureCollection
  data: ExtraGeoUnitsData
  sourceDate: Date
}

interface ExtChoroplethDataUnit {
  category: string
  name: string
  startDate: Date | null
  endDate: Date | null
}

interface ToolTipCtx {
  title: string
  id?: string
  periodStart: Date
  periodEnd: Date
  heatmapEntries: HeatmapRowEntry[]
  unitData: ExtraGeoUnitDataEntryValue[]
}

interface GeoMapData {
  featureCollection: ChoroplethGeoFeatureCollection<ExtChoroplethDataUnit>
  startDate: Date | null
  endDate: Date | null
}

interface PeriodData {
  date: Date
  data: GeoMapData
}

interface SpeedOption {
  value: number
  label: string
}

interface GeoRegionData {
  periodData: PeriodData[]
  paginatorOptions: { title: string; label: string; index: number }[]
  heatmapEntries: HeatmapRowEntry[]
  periodStart: Date
  periodEnd: Date
  fullData: ExtraGeoUnitDataByPeriod
}

@Component({
  selector: 'bag-detail-card-epidemiologic-geo-regions',
  templateUrl: './detail-card-epidemiologic-geo-regions.component.html',
  styleUrls: ['./detail-card-epidemiologic-geo-regions.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardEpidemiologicGeoRegionsComponent implements OnInit, OnDestroy {
  static readonly AFTER_FIRST_RENDERING_EV = 'DetailCardEpidemiologicGeoRegionsAfterFirstRendering'
  readonly speedOptions: SpeedOption[] = [
    { value: 500, label: '½x' },
    { value: 250, label: '1x' },
    { value: 125, label: '2x' },
  ]

  @Input()
  facet: 'print' | undefined | null

  @Input()
  infoAddOnKey?: string

  @ViewChild('tooltip', { static: true, read: TemplateRef })
  tooltipElRef: TemplateRef<ToolTipCtx>

  loading: boolean

  readonly cardDetailPath = RoutePaths.SHARE_GEO_REGIONS
  readonly categories = ['0-59', '60-119', '120-239', '240-479', '480-959', '960-1919', '1920+'].map((cat, index) => ({
    label: cat,
    color: COLORS_INZ_SUM_CAT[index],
  }))

  readonly geoLevelFilterOptions = getGeoLevelFilterOptions(DEFAULT_GEO_LEVEL_FILTER)
  readonly geoLevelFilterCtrl = new FormControl(this.route.snapshot.params[MatrixParams.GEO_LEVEL] || null)

  readonly periodSliderCtrl = new FormControl(null)

  get isRunning(): boolean {
    return this.isRunningSubject.value
  }

  get isComplete(): boolean {
    return this.periodSliderCtrl.value === this.maxProgress - 1
  }

  readonly speedCtrl = new FormControl(500)

  readonly currentValues$: Observable<CurrentValues> = this.route.data.pipe(
    map((routeData) => {
      const data = routeData[RouteDataKey.DETAIL_DATA]
      return {
        geoJson: routeData[RouteDataKey.GEO_JSON],
        data,
        geoLevelFilter: this.geoLevelFilterCtrl.value || DEFAULT_GEO_LEVEL_FILTER,
        sourceDate: new Date(data.sourceDate),
      }
    }),
  )
  readonly sourceDate$: Observable<Date> = this.currentValues$.pipe(map(({ sourceDate }) => sourceDate))
  readonly geoRegionData$: Observable<GeoRegionData> = this.currentValues$.pipe(
    map(this.prepareGeoRegionData.bind(this)),
    tap(() => (this.loading = false)),
    shareReplay(1),
  )

  readonly detailUrl$: Observable<string> = combineLatest([this.route.queryParams, this.route.params]).pipe(
    map(this.createShareUrl.bind(this)),
  )
  readonly downloadUrls$: Observable<ImageDownloadUrls> = combineLatest([
    this.route.queryParams,
    this.route.params,
  ]).pipe(switchMap(this.createImageDownloadUrls.bind(this)))

  readonly isRunning$: Observable<boolean>
  readonly svgState$: Observable<Record<string, boolean>>
  readonly initialVh: number

  private readonly geoDateSubject = new BehaviorSubject(this.route.snapshot.queryParams[QueryParams.GEO_DATE] || null)

  private readonly timerObserver: PartialObserver<number>
  private readonly isRunningSubject = new BehaviorSubject<boolean>(false)
  private readonly onDestroy = new Subject<void>()

  private pauseTimer$ = new Subject<void>()
  private maxProgress: number

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
    protected readonly translator: TranslatorService,
    protected readonly cd: ChangeDetectorRef,
    protected readonly uriService: UriService,
    protected readonly tooltipService: TooltipService,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly windowRef: WindowRef,
  ) {
    this.initialVh = this.windowRef.nativeWindow?.innerHeight || 0

    combineLatest([
      fromEvent(elementRef.nativeElement, ChoroplethCanvasComponent.AFTER_RENDERING_EV),
      fromEvent(elementRef.nativeElement, HeatmapRowComponent.AFTER_RENDERING_EV),
    ])
      .pipe(debounceTime(1_000), first())
      .subscribe(this.dispatchAfterFirstRenderingEv.bind(this))

    this.isRunning$ = this.isRunningSubject.asObservable()
    this.svgState$ = this.isRunning$.pipe(
      map((state) => {
        return {
          '#play-pause-part-1-anim-to-pause': state,
          '#play-pause-part-2-anim-to-pause': state,
          '#play-pause-part-1-anim-to-play': !state,
          '#play-pause-part-2-anim-to-play': !state,
        }
      }),
    )

    this.timerObserver = {
      next: (_: number) => {
        if (!this.isComplete) {
          this.periodSliderCtrl.setValue(this.periodSliderCtrl.value + 1)
        } else {
          this.pause()
        }
        this.cd.markForCheck()
      },
    }

    this.speedCtrl.valueChanges.pipe(takeUntil(this.onDestroy)).subscribe(this.changeSpeed.bind(this))
  }

  ngOnInit(): void {
    this.geoLevelFilterCtrl.valueChanges
      .pipe(
        tap(() => (this.loading = true)),
        map((value) => (value ? { [MatrixParams.GEO_LEVEL]: value } : {})),
      )
      .subscribe((matrixParams) => {
        this.router.navigate(['.', matrixParams], {
          relativeTo: this.route,
          replaceUrl: true,
          queryParamsHandling: 'preserve',
        })
      })

    this.periodSliderCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        withLatestFrom(this.geoRegionData$),
        filter(([ix, data]) => !!data.periodData[ix]),
        map(([ix, data]) => formatUtcDate(data.periodData[ix].date, 'yyyy-MM-dd')),
      )
      .subscribe((date) => this.geoDateSubject.next(date))

    this.geoRegionData$
      .pipe(map((data) => formatUtcDate(data.periodData[this.periodSliderCtrl.value].date, 'yyyy-MM-dd')))
      .subscribe((date) => this.geoDateSubject.next(date))

    this.geoDateSubject
      .pipe(
        map((value) => ({ [QueryParams.GEO_DATE]: value })),
        debounceTime(1000),
        takeUntil(this.onDestroy),
      )
      .subscribe(updateQueryParamsFn(this.router, { replaceUrl: true }))
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  sliderValueChanged(value: number) {
    this.periodSliderCtrl.setValue(value)
  }

  showTooltip(
    data: { source: any; unit: string; properties: ExtChoroplethDataUnit },
    fullData: ExtraGeoUnitDataByPeriod,
    periodStart: Date,
    periodEnd: Date,
  ) {
    const unitData: ExtraGeoUnitDataEntryValue[] = Object.entries(fullData).map(
      ([, currData]: [string, ExtraGeoUnitDataEntry]) => {
        return currData[data.unit]
      },
    )
    const tooltipCtx: ToolTipCtx = {
      id: data.unit,
      title: data.properties && data.properties.name ? data.properties.name : data.unit,
      heatmapEntries: this.createHeatmapEntries(fullData, data.unit),
      periodStart,
      periodEnd,
      unitData,
    }
    this.tooltipService.showTpl(data.source, this.tooltipElRef, tooltipCtx, {
      position: 'above',
      offsetY: 10,
    })
  }

  hideTooltip() {
    this.tooltipService.hide()
  }

  playOrPause() {
    if (this.isRunningSubject.value) {
      this.pause()
    } else {
      this.start()
    }
  }

  readonly canvasFillFn = (unit: { properties: ExtChoroplethDataUnit }): string =>
    this.categoryFillFn(unit.properties.category)

  categoryFillFn(category: string): string {
    switch (category) {
      case '0-59':
        return COLORS_INZ_SUM_CAT[0]
      case '60-119':
        return COLORS_INZ_SUM_CAT[1]
      case '120-239':
        return COLORS_INZ_SUM_CAT[2]
      case '240-479':
        return COLORS_INZ_SUM_CAT[3]
      case '480-959':
        return COLORS_INZ_SUM_CAT[4]
      case '960-1919':
        return COLORS_INZ_SUM_CAT[5]
      case '1920+':
        return COLORS_INZ_SUM_CAT[6]
      case null:
        return 'pink'
      default:
        return 'black'
    }
  }

  dateLabelFromUnitData(unitData: ExtraGeoUnitDataEntryValue): string {
    if (unitData.endDate && unitData.startDate !== unitData.endDate) {
      return this.dateRangeLabel(new Date(unitData.startDate), new Date(unitData.endDate))
    } else {
      return formatUtcDate(new Date(unitData.startDate))
    }
  }

  private pause() {
    this.pauseTimer$.next()
    this.isRunningSubject.next(false)
  }

  private start() {
    this.isRunningSubject.next(true)
    if (this.isComplete) {
      this.periodSliderCtrl.setValue(0)
    }

    interval(this.speedCtrl.value)
      .pipe(takeUntil(this.onDestroy), takeUntil(this.pauseTimer$))
      .subscribe(this.timerObserver)
  }

  private changeSpeed(val: number) {
    if (this.isRunningSubject.value) {
      this.pauseTimer$.next()
      interval(val).pipe(takeUntil(this.onDestroy), takeUntil(this.pauseTimer$)).subscribe(this.timerObserver)
    }
  }

  private prepareGeoRegionData(cv: CurrentValues): GeoRegionData {
    this.pause()

    const periodData: PeriodData[] = Object.entries(cv.data.values)
      .map(([key, entry]: [string, ExtraGeoUnitDataEntry]): PeriodData => {
        return {
          date: parseIsoDate(key),
          data: this.prepareMapData(entry, cv.geoJson, cv.geoLevelFilter),
        }
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    const paginatorOptions = periodData.map((period, index) => {
      return {
        label: period.data.endDate
          ? this.dateRangeLabel(period.data.startDate || new Date(0), period.data.endDate)
          : formatUtcDate(period.data.startDate || new Date(0)),
        title: this.translator.get(
          period.data.endDate ? 'DetailCardGeoRegions.Paginator.Period' : 'DetailCardGeoRegions.Paginator.Daily',
        ),
        index,
      }
    })
    const heatmapEntries: HeatmapRowEntry[] = this.createHeatmapEntries(cv.data.values)
    // init controls
    this.maxProgress = paginatorOptions.length
    const geoDate: string = this.geoDateSubject.value

    let ix = 0
    if (geoDate) {
      const indexOf = periodData.findIndex((pd) => {
        if (pd.data.startDate && pd.data.endDate) {
          const d = parseIsoDate(geoDate)
          return isWithinInterval(d, { start: pd.data.startDate, end: pd.data.endDate })
        } else {
          return formatUtcDate(pd.date, 'yyyy-MM-dd') === geoDate
        }
      })
      if (indexOf > -1) {
        ix = indexOf
      } else if (
        periodData[periodData.length - 1].data.endDate !== null &&
        isAfter(parseIsoDate(geoDate), <Date>periodData[periodData.length - 1].data.endDate)
      ) {
        ix = periodData.length - 1
      }
    }
    this.periodSliderCtrl.setValue(ix, { emitEvent: false })

    return {
      periodData,
      paginatorOptions,
      heatmapEntries,
      periodStart: parseIsoDate(cv.data.timeSpan.start),
      periodEnd: parseIsoDate(cv.data.timeSpan.end),
      fullData: cv.data.values,
    }
  }

  private createHeatmapEntries(data: ExtraGeoUnitDataByPeriod, unit = 'CH'): HeatmapRowEntry[] {
    return Object.entries(data).map(([date, currData]: [string, ExtraGeoUnitDataEntry]) => {
      return {
        date: new Date(date),
        color: this.categoryFillFn(currData[unit].normalizedCat),
      }
    })
  }

  private prepareMapData(
    data: ExtraGeoUnitDataEntry,
    geoJson: ExtendedGeoFeatureCollection,
    geoLevel: GeoLevelFilter,
  ): GeoMapData {
    const features = geoJson.features
      .map((geoJsonFeature: any) => {
        const unit =
          geoLevel === GeoLevelFilter.CANTONS
            ? getEnumKeyFromValue(CantonGeoUnitNumber, parseInt(geoJsonFeature.id, 10)) || geoJsonFeature.id
            : parseInt(geoJsonFeature.id, 10).toString(10)
        let name
        if (geoLevel === GeoLevelFilter.CANTONS) {
          name = this.translator.get(`GeoFilter.${unit}`)
        } else if (geoLevel === GeoLevelFilter.GREATER_REGIONS) {
          name = this.translator.get(`GeoFilter.CH0${unit}`)
        } else {
          name = geoJsonFeature.name
        }
        const category = data[unit] ? data[unit].normalizedCat : null
        const startDate = data[unit] ? parseIsoDate(data[unit].startDate) : null

        const endDate =
          data[unit] && data[unit].endDate && data[unit].startDate !== data[unit].endDate
            ? parseIsoDate(data[unit].endDate || '')
            : null
        return <ChoroplethGeoFeature<ExtChoroplethDataUnit>>{
          ...geoJsonFeature,
          unit,
          properties: { name, category, startDate, endDate },
        }
      })
      .filter((feat) => isDefined(feat.properties))

    return {
      featureCollection: {
        ...geoJson,
        features,
      },
      startDate: features[0].properties.startDate,
      endDate: features[0].properties.endDate,
    }
  }

  private createShareUrl([qp, mp]: [Params, Params]): string {
    return this.uriService.createShareUrl(
      `${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/case`,
      this.getCardDetailPathWithParams(mp),
    )
  }

  private createImageDownloadUrls([qp, mp]: [Params, Params]): Promise<ImageDownloadUrls> {
    const url = this.uriService.createExportUrl(
      `${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/case`,
      this.getCardDetailPathWithParams(mp),
    )
    return this.uriService.getImageDownloadDefinitions(url, 'case', this.cardDetailPath, null, {
      awaitEvent: DetailCardEpidemiologicGeoRegionsComponent.AFTER_FIRST_RENDERING_EV,
      viewportHeight: 1024, // styles are viewport height (vh) dependent
    })
  }

  private dispatchAfterFirstRenderingEv() {
    const ev = new Event(DetailCardEpidemiologicGeoRegionsComponent.AFTER_FIRST_RENDERING_EV, { bubbles: true })
    this.elementRef.nativeElement.dispatchEvent(ev)
  }

  private getCardDetailPathWithParams(params: Params): string {
    return params[MatrixParams.GEO_LEVEL]
      ? `${this.cardDetailPath};${MatrixParams.GEO_LEVEL}=${params[MatrixParams.GEO_LEVEL]}`
      : this.cardDetailPath
  }

  private dateRangeLabel(startDate: Date, endDate: Date): string {
    return this.translator.get('Commons.DateToDate', {
      date1: formatUtcDate(startDate),
      date2: formatUtcDate(endDate),
    })
  }
}
