import { Component, Inject, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { GdiObject, GdiObjectContext, Language, MultiLanguageText } from '@c19/commons'
import { Observable, ReplaySubject, Subject } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { ImageDownloadUrls } from '../cards-epidemiologic/base-detail-epidemiologic-card.component'
import { WeeklyReportDataPair } from '../core/data/data.service'
import { CURRENT_LANG } from '../core/i18n/language.token'
import { TranslatorService } from '../core/i18n/translator.service'
import { UriService } from '../core/uri.service'
import { RoutePaths } from '../routes/route-paths.enum'
import { TooltipService } from '../shared/components/tooltip/tooltip.service'
import { RegionsFilter } from '../shared/models/filters/regions-filter.enum'
import { QueryParams } from '../shared/models/query-params.enum'
import { selectChanged } from '../static-utils/select-changed.operator'

export interface CurrenWrValuesBase {
  isoWeek: number | null
  prevWeekStart: Date
  currWeekStart: Date
  regionsFilter?: RegionsFilter
}

@Component({ template: '' })
export abstract class BaseWeeklyReportCardComponent<T extends GdiObjectContext> implements OnChanges, OnDestroy {
  @Input()
  set data(data: WeeklyReportDataPair<T>) {
    this._data = data
    this.init()
  }

  get data(): WeeklyReportDataPair<T> {
    return this._data
  }

  @Input()
  facet: 'print' | undefined | null

  @Input()
  infoAddOnKey?: string

  abstract readonly currentValues$: Observable<CurrenWrValuesBase>
  abstract readonly description$: Observable<string>

  readonly detailUrl$ = this.route.queryParams.pipe(map(this.createShareUrl.bind(this)))
  readonly downloadUrls$ = this.route.queryParams.pipe(switchMap(this.createImageDownloadUrls.bind(this)))

  protected readonly isoWeekFilter$: Observable<number | null> = this.route.queryParams.pipe(
    selectChanged(QueryParams.ISO_WEEK_FILTER),
    map((v) => (v ? parseInt(v, 10) : null)),
  )

  protected readonly onChanges$: Observable<SimpleChanges>
  protected readonly onDestroy = new Subject<void>()

  protected abstract readonly cardDetailPath: string

  protected topic: string

  private _data: WeeklyReportDataPair<T>
  private readonly onChangesSubject = new ReplaySubject<SimpleChanges>(1)

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected uriService: UriService,
    protected translator: TranslatorService,
    @Inject(CURRENT_LANG) protected lang: Language,
    protected readonly tooltipService: TooltipService,
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

  multiLangOrFallbackText(text: MultiLanguageText | undefined): string {
    return (text && text[this.lang]) || this.translator.get('WeeklyReport.NoDataText')
  }

  hideTooltip() {
    this.tooltipService.hide()
  }

  protected init() {
    if (this.data && this.data.curr.gdiObject) {
      this.topic =
        this.data.curr.gdiObject === GdiObject.WEEKLY_SIT_REP ||
        this.data.curr.gdiObject === GdiObject.HOSP_CAPACITY_ICU
          ? this.data.curr.gdiObject
          : this.data.curr.gdiObject.split('Covid')[1]
    }
  }

  private createShareUrl(): string {
    const topic = this.topic.toLocaleLowerCase()
    return this.uriService.createShareUrl(`${RoutePaths.DASHBOARD_WEEKLY_REPORT}/${topic}`, this.cardDetailPath)
  }

  private createImageDownloadUrls(): Promise<ImageDownloadUrls> {
    const topic = this.topic.toLocaleLowerCase()
    const url = this.uriService.createExportUrl(`${RoutePaths.DASHBOARD_WEEKLY_REPORT}/${topic}`, this.cardDetailPath)
    return this.uriService.getImageDownloadDefinitions(url, this.data.curr.gdiObject, this.cardDetailPath)
  }
}
