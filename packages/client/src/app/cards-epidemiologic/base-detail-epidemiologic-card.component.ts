import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CantonGeoUnit,
  DEFAULT_GEO_UNIT,
  GdiObject,
  GdiObjectTimeFrameContext,
  TimeSpan,
  TopLevelGeoUnit,
} from '@c19/commons'
import { Observable, ReplaySubject, Subject } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { TranslatorService } from '../core/i18n/translator.service'
import { UriService } from '../core/uri.service'
import { RoutePaths } from '../routes/route-paths.enum'
import { TooltipService } from '../shared/components/tooltip/tooltip.service'
import { DEFAULT_TIME_SLOT_FILTER_DETAIL, TimeSlotFilter } from '../shared/models/filters/time-slot-filter.enum'
import { QueryParams } from '../shared/models/query-params.enum'
import { formatUtcDate, parseIsoDate } from '../static-utils/date-utils'
import { selectChanged } from '../static-utils/select-changed.operator'

export interface CurrentValuesBase {
  geoUnit: CantonGeoUnit | TopLevelGeoUnit
  timeFrame: TimeSpan
  timeFilter: TimeSlotFilter
}

export interface ImageDownloadUrls {
  png: {
    url: string
    filename: string
  }
  jpeg: {
    url: string
    filename: string
  }
}

@Component({ template: '' })
export abstract class BaseDetailEpidemiologicCardComponent<T extends GdiObjectTimeFrameContext>
  implements OnChanges, OnDestroy
{
  @Input()
  set data(data: T) {
    this._data = data
    this.init()
  }

  get data(): T {
    return this._data
  }

  @Input()
  facet: 'print' | undefined | null

  @Input()
  infoAddOnKey?: string

  @Input()
  hideInfo: boolean

  titleKey: string
  infoKey: string
  warnKey?: string
  topicKey: string
  metaInzKey: string
  metaAbsKey: string
  tooltipInzKey: string
  tooltipAbsKey: string
  legendZeroKey: string

  get isGdiCase(): boolean {
    return this.data.gdiObject === GdiObject.CASE
  }

  get isGdiTest(): boolean {
    return this.data.gdiObject === GdiObject.TEST
  }

  readonly timeFilter$: Observable<TimeSlotFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.TIME_FILTER, DEFAULT_TIME_SLOT_FILTER_DETAIL),
  )

  readonly selectedGeoUnit$: Observable<CantonGeoUnit | TopLevelGeoUnit> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER, DEFAULT_GEO_UNIT),
  )

  protected readonly onChanges$: Observable<SimpleChanges>
  protected readonly onDestroy = new Subject<void>()

  abstract readonly currentValues$: Observable<CurrentValuesBase>
  abstract readonly description$: Observable<string>
  readonly detailUrl$: Observable<string> = this.route.queryParams.pipe(map(this.createShareUrl.bind(this)))
  readonly downloadUrls$: Observable<ImageDownloadUrls> = this.route.queryParams.pipe(
    switchMap(this.createImageDownloadUrls.bind(this)),
  )

  protected abstract initCard(topic: string, gdiObject: GdiObject): void

  protected abstract cardDetailPath: string

  private _data: T

  private readonly onChangesSubject = new ReplaySubject<SimpleChanges>(1)

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
    protected readonly translator: TranslatorService,
    protected readonly uriService: UriService,
    protected readonly tooltipService: TooltipService,
  ) {
    this.onChanges$ = this.onChangesSubject.asObservable()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.onChangesSubject.next(changes)
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  hideTooltip() {
    this.tooltipService.hide()
  }

  createDescription({ timeFrame, geoUnit }: CurrentValuesBase): string {
    const [date1, date2] = [timeFrame.start, timeFrame.end].map((d) => formatUtcDate(parseIsoDate(d)))
    const parts = [
      this.translator.get(this.topicKey),
      this.translator.get(`GeoFilter.${geoUnit}`),
      this.translator.get('Commons.DateToDate', { date1, date2 }),
    ]
    return parts.map((part) => `<span>${part}</span>`).join(', ')
  }

  private createShareUrl(): string {
    const topic = this.data.gdiObject.split('Covid')[1].toLocaleLowerCase()
    return this.uriService.createShareUrl(`${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/${topic}`, this.cardDetailPath)
  }

  private createImageDownloadUrls(): Promise<ImageDownloadUrls> {
    const topic = this.data.gdiObject.split('Covid')[1].toLocaleLowerCase()
    const url = this.uriService.createExportUrl(`${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/${topic}`, this.cardDetailPath)
    return this.uriService.getImageDownloadDefinitions(url, this.data.gdiObject, this.cardDetailPath)
  }

  private init() {
    if (this.data && this.data.gdiObject) {
      const topic = this.data.gdiObject.split('Covid')[1]
      switch (this.data.gdiObject) {
        case GdiObject.CASE:
        case GdiObject.DEATH:
        case GdiObject.HOSP:
          this.topicKey = `Detail${topic}.Title`
          this.metaAbsKey = `Commons.Cases`
          this.metaInzKey = `Commons.Cases.Inz100K`
          this.tooltipAbsKey = `Commons.Cases`
          this.tooltipInzKey = `Commons.Cases.Inz100K.Abbr`
          this.legendZeroKey = `Commons.NoCase`
          break
        case GdiObject.TEST:
          this.topicKey = `DetailTest.Title.Test`
          this.metaAbsKey = `Commons.Tests`
          this.metaInzKey = `Commons.Tests.Inz100K`
          this.tooltipAbsKey = `Commons.Tests`
          this.tooltipInzKey = `Commons.Tests.Inz100K.Abbr`
          this.legendZeroKey = `Commons.NoTest`
          break
        default:
        // do nothing, ignore CovidCT
      }
      if (this.data.gdiObject === GdiObject.HOSP) {
        this.warnKey = 'DetailHosp.Warning'
      }
      // init card specific keys in subclass
      this.initCard(topic, this.data.gdiObject)
    }
  }
}
