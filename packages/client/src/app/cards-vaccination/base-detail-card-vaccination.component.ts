import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CantonGeoUnit,
  DEFAULT_GEO_UNIT,
  GdiObject,
  GdiObjectContext,
  TimeSpan,
  TopLevelGeoUnit,
  VaccinationGdiObject,
  vaccinationGdiToSimpleGdi,
} from '@c19/commons'
import { merge, Observable, ReplaySubject, Subject } from 'rxjs'
import { map, switchMap, takeUntil, tap } from 'rxjs/operators'
import { ImageDownloadUrls } from '../cards-epidemiologic/base-detail-epidemiologic-card.component'
import { TranslatorService } from '../core/i18n/translator.service'
import { UriService } from '../core/uri.service'
import { RoutePaths } from '../routes/route-paths.enum'
import { TooltipService } from '../shared/components/tooltip/tooltip.service'
import {
  DEFAULT_VACC_PERSONS_REL_ABS_FILTER,
  getVaccPersonsRelAbsFilterOptions,
  VaccPersonsRelAbsFilter,
} from '../shared/models/filters/vacc-persons-rel-abs-filter.enum'
import {
  DEFAULT_VACCINATION_RELATIVITY_FILTER,
  getVaccinationRelativityFilterOptions,
  VaccinationRelativityFilter,
} from '../shared/models/filters/vaccination-relativity-filter.enum'
import { QueryParams } from '../shared/models/query-params.enum'
import { formatUtcDate, parseIsoDate } from '../static-utils/date-utils'
import { emitValToOwnViewFn } from '../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../static-utils/update-query-param.function'

export interface CurrentValuesVaccinationBase {
  geoUnit: CantonGeoUnit | TopLevelGeoUnit
  timeSpan: TimeSpan
  descriptionSingleDate?: boolean
}

export interface VaccRestrictedGdiObjectTimespanContext extends GdiObjectContext {
  gdiObject: VaccinationGdiObject
}

@Component({ template: '' })
export abstract class BaseDetailCardVaccinationComponent<T extends VaccRestrictedGdiObjectTimespanContext>
  implements OnInit, OnChanges, OnDestroy
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
  hideInfo = false

  readonly vaccDosesRelativityFilterOptions = getVaccinationRelativityFilterOptions(
    DEFAULT_VACCINATION_RELATIVITY_FILTER,
  )
  readonly vaccDosesRelativityFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.VACC_REL_FILTER] || null,
  )
  readonly vaccDosesRelativityFilter$: Observable<VaccinationRelativityFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACC_REL_FILTER, DEFAULT_VACCINATION_RELATIVITY_FILTER),
    tap<VaccinationRelativityFilter>(
      emitValToOwnViewFn(this.vaccDosesRelativityFilterCtrl, DEFAULT_VACCINATION_RELATIVITY_FILTER),
    ),
  )

  readonly vaccPersonsRelativityFilterOptions = getVaccPersonsRelAbsFilterOptions(DEFAULT_VACC_PERSONS_REL_ABS_FILTER)
  readonly vaccPersonsRelativityFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.VACC_PERSONS_REL_FILTER] || null,
  )
  readonly vaccPersonsRelativityFilter$: Observable<VaccPersonsRelAbsFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACC_PERSONS_REL_FILTER, DEFAULT_VACC_PERSONS_REL_ABS_FILTER),
    tap<VaccPersonsRelAbsFilter>(
      emitValToOwnViewFn(this.vaccPersonsRelativityFilterCtrl, DEFAULT_VACC_PERSONS_REL_ABS_FILTER),
    ),
  )

  readonly selectedGeoUnit$: Observable<CantonGeoUnit | TopLevelGeoUnit> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER, DEFAULT_GEO_UNIT),
  )

  readonly detailUrl$: Observable<string> = this.route.queryParams.pipe(map(this.prepareShareUrl.bind(this)))
  readonly downloadUrls$: Observable<ImageDownloadUrls> = this.route.queryParams.pipe(
    switchMap(this.prepareDownloadUrls.bind(this)),
  )
  abstract readonly description$: Observable<string>

  protected readonly onChanges$: Observable<SimpleChanges>
  protected readonly onDestroy = new Subject<void>()

  protected abstract cardDetailPath: string

  private readonly onChangesSubject = new ReplaySubject<SimpleChanges>(1)
  private _data: T

  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
    protected readonly translator: TranslatorService,
    protected readonly uriService: UriService,
    protected readonly tooltipService: TooltipService,
  ) {
    this.onChanges$ = this.onChangesSubject.asObservable()
  }

  ngOnInit() {
    merge(
      this.vaccDosesRelativityFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.VACC_REL_FILTER]: v }))),
      this.vaccPersonsRelativityFilterCtrl.valueChanges.pipe(
        map((v) => ({ [QueryParams.VACC_PERSONS_REL_FILTER]: v })),
      ),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))
  }

  protected abstract init(): void

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

  resetToChFl() {
    updateQueryParamsFn(this.router)({ [QueryParams.GEO_FILTER]: null })
  }

  protected prepareDescription(cv: CurrentValuesVaccinationBase): string {
    const [date1, date2] = [cv.timeSpan.start, cv.timeSpan.end].map((d) => formatUtcDate(parseIsoDate(d)))
    const detailTitleKey =
      this.data.gdiObject === GdiObject.VACC_DOSES
        ? 'Vaccination.VaccDoses.DetailTitle'
        : this.data.gdiObject === GdiObject.VACC_PERSONS
        ? this.cardDetailPath === RoutePaths.SHARE_GEOGRAPHY
          ? 'Vaccination.VaccPersons.DetailTitleByResidence'
          : 'Vaccination.VaccPersons.DetailTitle'
        : 'Vaccination.VaccSymptoms.DetailTitle'
    return [
      this.translator.get(detailTitleKey),
      this.translator.get(`GeoFilter.${cv.geoUnit}`),
      cv.descriptionSingleDate
        ? this.translator.get('Commons.DateStatus', { date: date2 })
        : this.translator.get('Commons.DateToDate', { date1, date2 }),
    ].join(', ')
  }

  protected prepareShareUrl(): string {
    const topic = this.getTopicPath()
    return this.uriService.createShareUrl(`${RoutePaths.DASHBOARD_VACCINATION}/${topic}`, this.cardDetailPath)
  }

  protected prepareDownloadUrls(): Promise<ImageDownloadUrls> {
    const topic = this.getTopicPath()
    const url = this.uriService.createExportUrl(`${RoutePaths.DASHBOARD_VACCINATION}/${topic}`, this.cardDetailPath)
    return this.uriService.getImageDownloadDefinitions(url, topic, this.cardDetailPath)
  }

  private getTopicPath() {
    return vaccinationGdiToSimpleGdi[this.data.gdiObject].replace('vacc-', '')
  }
}
