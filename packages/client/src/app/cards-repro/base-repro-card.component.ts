import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CantonGeoUnit, DEFAULT_GEO_UNIT, GdiObject, TopLevelGeoUnit } from '@c19/commons'
import { Observable, ReplaySubject, Subject } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { ImageDownloadUrls } from '../cards-epidemiologic/base-detail-epidemiologic-card.component'
import { TranslatorService } from '../core/i18n/translator.service'
import { UriService } from '../core/uri.service'
import { RoutePaths } from '../routes/route-paths.enum'
import { TooltipService } from '../shared/components/tooltip/tooltip.service'
import { QueryParams } from '../shared/models/query-params.enum'
import { selectChanged } from '../static-utils/select-changed.operator'

@Component({ template: '' })
export abstract class BaseReproCardComponent<T> implements OnChanges, OnDestroy {
  @Input()
  data: T

  @Input()
  facet: 'print' | undefined | null

  @Input()
  shareMode: boolean

  @Input()
  infoAddOnKey?: string

  abstract readonly cardType: string
  readonly chQueryParams = { [QueryParams.GEO_FILTER]: TopLevelGeoUnit.CH }
  readonly detailUrl$ = this.route.queryParams.pipe(map(this.createShareUrl.bind(this)))
  readonly downloadUrls$ = this.route.queryParams.pipe(switchMap(this.createImageDownloadUrls.bind(this)))

  protected readonly geoUnitFilter$: Observable<CantonGeoUnit | null> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER, DEFAULT_GEO_UNIT),
  )

  protected readonly onChanges$: Observable<SimpleChanges>
  protected readonly onDestroy = new Subject<void>()

  private readonly onChangesSubject = new ReplaySubject<SimpleChanges>(1)

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected tooltipService: TooltipService,
    protected translator: TranslatorService,
    protected uriService: UriService,
  ) {
    this.onChanges$ = this.onChangesSubject.asObservable()
  }

  ngOnDestroy(): void {
    this.onChangesSubject.complete()
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.onChangesSubject.next(changes)
  }

  hideTooltip() {
    this.tooltipService.hide()
  }

  private createShareUrl(): string {
    const pathPart = `${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/${RoutePaths.DASHBOARD_EPIDEMIOLOGIC_REPRO}`
    return this.uriService.createShareUrl(pathPart, this.cardType)
  }

  private createImageDownloadUrls(): Promise<ImageDownloadUrls> {
    const pathPart = `${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/${RoutePaths.DASHBOARD_EPIDEMIOLOGIC_REPRO}`
    const url = this.uriService.createExportUrl(pathPart, this.cardType)
    return this.uriService.getImageDownloadDefinitions(url, GdiObject.RE, this.cardType)
  }
}
