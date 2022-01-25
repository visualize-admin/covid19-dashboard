import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { IntGeoUnit } from '@c19/commons'
import { Observable, ReplaySubject, Subject } from 'rxjs'
import { TranslatorService } from '../core/i18n/translator.service'
import { UriService } from '../core/uri.service'
import { RoutePaths } from '../routes/route-paths.enum'
import { TooltipService } from '../shared/components/tooltip/tooltip.service'
import { QueryParams } from '../shared/models/query-params.enum'
import { selectChanged } from '../static-utils/select-changed.operator'

@Component({ template: '' })
export abstract class BaseInternationalCardComponent implements OnChanges, OnDestroy {
  @Input()
  facet: 'print' | undefined | null

  @Input()
  infoAddOnKey?: string

  protected abstract topic: string
  protected abstract cardType: string

  protected readonly geoUnitFilter$: Observable<IntGeoUnit | null> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER),
  )

  protected readonly onChanges$: Observable<SimpleChanges>
  protected readonly onDestroy = new Subject<void>()

  private readonly onChangesSubject = new ReplaySubject<SimpleChanges>(1)

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
    protected readonly tooltipService: TooltipService,
    protected readonly uriService: UriService,
    protected readonly translator: TranslatorService,
  ) {
    this.onChanges$ = this.onChangesSubject.asObservable()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.onChangesSubject.next(changes)
  }

  ngOnDestroy(): void {
    this.onChangesSubject.complete()
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  hideTooltip() {
    this.tooltipService.hide()
  }

  protected createShareUrl() {
    const pathPart = `${RoutePaths.DASHBOARD_INTERNATIONAL}/${this.topic}`
    return this.uriService.createShareUrl(pathPart, this.cardType)
  }

  protected createImageDownloadUrls() {
    const routePart = `${RoutePaths.DASHBOARD_INTERNATIONAL}/${this.topic}`
    const url = this.uriService.createExportUrl(routePart, this.cardType)
    return this.uriService.getImageDownloadDefinitions(url, 'international_case', this.cardType)
  }
}
