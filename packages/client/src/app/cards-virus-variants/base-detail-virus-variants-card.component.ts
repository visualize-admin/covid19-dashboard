import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CantonGeoUnit,
  DEFAULT_GEO_UNIT,
  EpidemiologicSimpleGdi,
  GdiObjectTimeFrameContext,
  GdiObjectTimespanContext,
  TimeSpan,
  TopLevelGeoUnit,
} from '@c19/commons'
import { Observable, ReplaySubject, Subject } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { ImageDownloadUrls } from '../cards-epidemiologic/base-detail-epidemiologic-card.component'
import { TranslatorService } from '../core/i18n/translator.service'
import { UriService } from '../core/uri.service'
import { RoutePaths } from '../routes/route-paths.enum'
import { TooltipService } from '../shared/components/tooltip/tooltip.service'
import { QueryParams } from '../shared/models/query-params.enum'
import { DEFAULT_TIME_SLOT_FILTER_DETAIL, TimeSlotFilter } from '../shared/models/filters/time-slot-filter.enum'
import { formatUtcDate, parseIsoDate } from '../static-utils/date-utils'
import { selectChanged } from '../static-utils/select-changed.operator'

export interface CurrentValuesBase {
  geoUnit: CantonGeoUnit | TopLevelGeoUnit
  timeSpan: TimeSpan
}

@Component({ template: '' })
export abstract class BaseDetailVirusVariantsCardComponent<
  T extends GdiObjectTimespanContext | GdiObjectTimeFrameContext,
> implements OnChanges, OnDestroy
{
  @Input()
  data: T

  @Input()
  facet: 'print' | undefined | null

  @Input()
  infoAddOnKey?: string

  @Input()
  hideInfo = false

  readonly selectedGeoUnit$: Observable<CantonGeoUnit | TopLevelGeoUnit> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER, DEFAULT_GEO_UNIT),
  )
  readonly timeFilter$: Observable<TimeSlotFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.TIME_FILTER, DEFAULT_TIME_SLOT_FILTER_DETAIL),
  )

  readonly detailUrl$: Observable<string> = this.route.queryParams.pipe(map(this.prepareShareUrl.bind(this)))

  readonly downloadUrls$: Observable<ImageDownloadUrls> = this.route.queryParams.pipe(
    switchMap(this.prepareDownloadUrls.bind(this)),
  )

  protected readonly onChanges$: Observable<SimpleChanges>
  protected readonly onDestroy = new Subject<void>()

  protected abstract cardDetailPath: string

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

  protected prepareDescription({ timeSpan, geoUnit }: CurrentValuesBase): string {
    const [date1, date2] = [timeSpan.start, timeSpan.end].map((d) => formatUtcDate(parseIsoDate(d)))
    return [
      this.translator.get(`Epidemiologic.VirusVariants.Card.DescriptionTitle`),
      this.translator.get(`GeoFilter.${geoUnit}`),
      this.translator.get('Commons.DateToDate', { date1, date2 }),
    ].join(', ')
  }

  protected prepareShareUrl(): string {
    const topic = EpidemiologicSimpleGdi.VIRUS_VARIANTS
    return this.uriService.createShareUrl(`${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/${topic}`, this.cardDetailPath)
  }

  protected prepareDownloadUrls(): Promise<ImageDownloadUrls> {
    const topic = EpidemiologicSimpleGdi.VIRUS_VARIANTS
    const url = this.uriService.createExportUrl(`${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/${topic}`, this.cardDetailPath)
    return this.uriService.getImageDownloadDefinitions(url, topic, this.cardDetailPath)
  }
}
