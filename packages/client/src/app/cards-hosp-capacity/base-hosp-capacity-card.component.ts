import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CantonGeoUnit, GdiObject, GdiObjectContext, TopLevelGeoUnit } from '@c19/commons'
import { Observable, ReplaySubject, Subject } from 'rxjs'
import { TranslatorService } from '../core/i18n/translator.service'
import { UriService } from '../core/uri.service'
import { RoutePaths } from '../routes/route-paths.enum'
import { TooltipService } from '../shared/components/tooltip/tooltip.service'
import { QueryParams } from '../shared/models/query-params.enum'
import { selectChanged } from '../static-utils/select-changed.operator'

@Component({ template: '' })
export abstract class BaseHospCapacityCardComponent<T extends GdiObjectContext> implements OnChanges, OnDestroy {
  @Input()
  set data(value: T) {
    this._data = value
    this.init(value)
    this.initCard(value)
  }

  get data(): T {
    return this._data
  }

  @Input()
  facet: 'print' | undefined | null

  @Input()
  infoAddOnKey?: string

  @Input()
  hideInfo = false

  topicKey: string
  noneAbbrKey: string
  infoKey: string
  noneKey: string

  protected readonly geoUnitFilter$: Observable<CantonGeoUnit | TopLevelGeoUnit.CH> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER, TopLevelGeoUnit.CH),
  )

  protected readonly onChanges$: Observable<SimpleChanges>
  protected readonly onDestroy = new Subject<void>()

  protected abstract readonly cardDetailPath: string

  private _data: T
  private readonly onChangesSubject = new ReplaySubject<SimpleChanges>(1)

  constructor(
    protected readonly router: Router,
    protected readonly route: ActivatedRoute,
    protected readonly uriService: UriService,
    protected readonly tooltipService: TooltipService,
    protected readonly translator: TranslatorService,
  ) {
    this.onChanges$ = this.onChangesSubject.asObservable()
  }

  protected abstract initCard(data: T): void

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

  protected init({ gdiObject }: T) {
    switch (gdiObject) {
      case GdiObject.HOSP_CAPACITY_ICU:
        this.topicKey = `HospCapacity.Icu.DetailTitle`
        this.noneKey = `HospCapacity.Icu.NoIntensiveCareUnits`
        this.noneAbbrKey = `HospCapacity.Icu.NoIntensiveCareUnits.Abbr`
        break
      case GdiObject.HOSP_CAPACITY_TOTAL:
        this.topicKey = `HospCapacity.Total.DetailTitle`
        this.noneKey = `HospCapacity.Total.NoHospital`
        this.noneAbbrKey = `HospCapacity.Total.NoHospital`
        break
      default:
        throw new Error(`${gdiObject} Data not supported for BaseHospCapacityCard`)
    }
  }

  protected createShareUrl(): string {
    const topic = this.data.gdiObject.split('HospCapacity')[1].toLocaleLowerCase()
    return this.uriService.createShareUrl(`${RoutePaths.DASHBOARD_CAPACITY}/${topic}`, this.cardDetailPath)
  }

  protected createImageDownloadUrls() {
    const topic = this.data.gdiObject.split('HospCapacity')[1].toLocaleLowerCase()
    const url = this.uriService.createExportUrl(`${RoutePaths.DASHBOARD_CAPACITY}/${topic}`, this.cardDetailPath)
    return this.uriService.getImageDownloadDefinitions(url, this.data.gdiObject, this.cardDetailPath)
  }
}
