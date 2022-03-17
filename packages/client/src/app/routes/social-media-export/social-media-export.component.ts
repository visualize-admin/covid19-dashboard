import { HttpParams } from '@angular/common/http'
import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID, OnDestroy } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
  GdiObject,
  GdiSubset,
  Language,
  OverviewCardV3,
  OverviewDataObjectKeys,
  OverviewDataV4,
  VaccinationSimpleGdi,
} from '@c19/commons'
import { ORIGIN } from '@shiftcode/ngx-core'
import { getEnumValues } from '@shiftcode/utilities'
import { pascalCase } from 'change-case'
import { addDays } from 'date-fns'
import { Observable, Subject } from 'rxjs'
import { map, switchMap, takeUntil, tap } from 'rxjs/operators'
import { ImageDownloadUrls } from '../../cards-epidemiologic/base-detail-epidemiologic-card.component'
import { CURRENT_LANG } from '../../core/i18n/language.token'
import { TRANSLATOR_PROVIDER } from '../../core/i18n/translator-provider.const'
import { TextArgs } from '../../core/i18n/translator.service'
import { UriService } from '../../core/uri.service'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import { GeoViewFilter } from '../../shared/models/filters/geo-view-filter.enum'
import { TimeSlotFilter, timeSlotFilterKey } from '../../shared/models/filters/time-slot-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { TwitterImages } from '../export/export-twitter-images/export-twitter-images.component'
import { RouteDataKey } from '../route-data-key.enum'
import { RoutePaths } from '../route-paths.enum'

interface VaccTopicGeoView {
  topic: VaccinationSimpleGdi.VACC_DOSES | VaccinationSimpleGdi.VACC_PERSONS
  geoView: GeoViewFilter
}

const DEFAULT_OV_TIME_FILTER = TimeSlotFilter.LAST_4_WEEKS

const reduceWithPrefix = (prefix: string) => {
  return (u: Record<string, string>, [key, val]: [string, number | string | null]) => ({
    ...u,
    [`${prefix}${pascalCase(key)}`]:
      typeof val === 'number' || val === null ? adminFormatNum(val) : formatUtcDate(parseIsoDate(val), 'dd.MM.yyyy'),
  })
}

@Component({
  selector: 'bag-social-media-export',
  templateUrl: './social-media-export.component.html',
  styleUrls: ['./social-media-export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TRANSLATOR_PROVIDER, TooltipService],
})
export class SocialMediaExportComponent implements OnDestroy {
  readonly sourceDate: Date
  readonly casesDayDiff: number | null
  readonly overviewCardDownloadUrls$: Observable<ImageDownloadUrls[]>
  readonly cardCombinationDownloadUrls$: Observable<ImageDownloadUrls[]>
  readonly vaccinationDetailDownloadUrl: Promise<ImageDownloadUrls[]>

  readonly overviewTweetArgs: TextArgs
  readonly vaccineTweetArgs: TextArgs

  readonly timeFilterOptions: Array<{ labelKey: string; value: string | null }> = getEnumValues(TimeSlotFilter).map(
    (val) => ({
      labelKey: timeSlotFilterKey[<TimeSlotFilter>val],
      value: val === DEFAULT_OV_TIME_FILTER ? null : val,
    }),
  )
  readonly overviewTimeFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.TIME_FILTER] || null)
  readonly overviewTimeFilter$: Observable<TimeSlotFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.TIME_FILTER, DEFAULT_OV_TIME_FILTER),
  )

  private readonly onDestroy = new Subject<void>()

  constructor(
    @Inject(ORIGIN) protected readonly origin: string,
    @Inject(LOCALE_ID) private readonly locale: string,
    @Inject(CURRENT_LANG) protected readonly lang: Language,
    private readonly uriService: UriService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.overviewTimeFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        tap<TimeSlotFilter | null>(emitValToOwnViewFn(this.overviewTimeFilterCtrl)),
        map((v) => ({ [QueryParams.TIME_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))

    const overviewData: OverviewDataV4 = this.route.snapshot.data[RouteDataKey.OVERVIEW_DATA]
    this.sourceDate = new Date(overviewData.covidCase.sourceDate)
    this.casesDayDiff = overviewData.covidCase.deltaDay
    this.overviewTweetArgs = this.getOverviewTweetArgs(overviewData)
    this.vaccineTweetArgs = this.getVaccineTweetArgs(overviewData)

    const cardTypes: OverviewDataObjectKeys[] = [
      'covidCase',
      'covidTest',
      'covidHosp',
      'covidDeath',
      'covidVirusVariants',
      'covidRe',
      'covidCt',
      'covidVacc',
      'hospCapacity',
    ]
    this.overviewCardDownloadUrls$ = this.overviewTimeFilter$.pipe(
      switchMap((timeFilter) => Promise.all(cardTypes.map(this.createOverviewCardDownloadUrls(timeFilter)))),
    )

    const twitterImages = <TwitterImages[]>getEnumValues(TwitterImages)
    this.cardCombinationDownloadUrls$ = this.overviewTimeFilter$.pipe(
      switchMap((timeFilter) => Promise.all(twitterImages.map(this.createCardCombinationDownloadUrls(timeFilter)))),
    )

    const vaccinationTopics: VaccTopicGeoView[] = [
      {
        topic: VaccinationSimpleGdi.VACC_DOSES,
        geoView: GeoViewFilter.MAP,
      },
      {
        topic: VaccinationSimpleGdi.VACC_DOSES,
        geoView: GeoViewFilter.TABLE,
      },
      {
        topic: VaccinationSimpleGdi.VACC_PERSONS,
        geoView: GeoViewFilter.MAP,
      },
      {
        topic: VaccinationSimpleGdi.VACC_PERSONS,
        geoView: GeoViewFilter.TABLE,
      },
    ]

    const hospCapIcuGeoAllUrl = this.uriService.createExportUrl(
      `${RoutePaths.DASHBOARD_CAPACITY}/${RoutePaths.DASHBOARD_CAPACITY_ICU}`,
      RoutePaths.SHARE_GEOGRAPHY,
      { [QueryParams.HIDE_INFO]: true },
    )
    const hospCapIcuGeoAll: Promise<ImageDownloadUrls> = this.uriService.getImageDownloadDefinitions(
      hospCapIcuGeoAllUrl,
      GdiObject.HOSP_CAPACITY_ICU,
      `${RoutePaths.SHARE_GEOGRAPHY}_${GeoViewFilter.MAP}`,
      this.lang,
    )

    const hospGeoInzUrl = this.uriService.createExportUrl(
      `${RoutePaths.DASHBOARD_EPIDEMIOLOGIC}/${RoutePaths.DASHBOARD_EPIDEMIOLOGIC_HOSP}`,
      RoutePaths.SHARE_GEOGRAPHY,
      {
        [QueryParams.HIDE_INFO]: true,
        [QueryParams.TIME_FILTER]: TimeSlotFilter.LAST_2_WEEKS,
      },
    )
    const hospGeoInz: Promise<ImageDownloadUrls> = this.uriService.getImageDownloadDefinitions(
      hospGeoInzUrl,
      GdiObject.HOSP,
      `${RoutePaths.SHARE_GEOGRAPHY}_${GeoViewFilter.MAP}`,
      this.lang,
    )

    this.vaccinationDetailDownloadUrl = Promise.all([
      ...vaccinationTopics.map(this.createVaccinationDetailDownloadUrls),
      hospCapIcuGeoAll,
      hospGeoInz,
    ])
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  private createOverviewCardDownloadUrls(timeFilter: TimeSlotFilter) {
    const qp = { [QueryParams.TIME_FILTER]: timeFilter }
    const queryParams = `?${new HttpParams({ fromObject: qp }).toString()}`

    return (cardType: OverviewDataObjectKeys): Promise<ImageDownloadUrls> => {
      const url = `${this.origin}/${this.lang}/${RoutePaths.EXPORT}/${RoutePaths.EXPORT_OVERVIEW}/${cardType}${queryParams}`
      return this.uriService.getImageDownloadDefinitions(url, cardType, `overview-${timeFilter}`, this.lang)
    }
  }

  private createCardCombinationDownloadUrls(timeFilter: TimeSlotFilter) {
    const qp = { [QueryParams.TIME_FILTER]: timeFilter }
    const queryParams = `?${new HttpParams({ fromObject: qp }).toString()}`

    return (type: string): Promise<ImageDownloadUrls> => {
      const url = `${this.origin}/${this.lang}/${RoutePaths.EXPORT}/${RoutePaths.EXPORT_TWITTER_IMAGES}/${type}${queryParams}`
      return this.uriService.getImageDownloadDefinitions(url, type, `overview-${timeFilter}`, this.lang)
    }
  }

  private readonly createVaccinationDetailDownloadUrls = (topicView: VaccTopicGeoView): Promise<ImageDownloadUrls> => {
    const exportUrl = this.uriService.createExportUrl(
      `${RoutePaths.DASHBOARD_VACCINATION}/${topicView.topic.replace('vacc-', '')}`,
      RoutePaths.SHARE_GEOGRAPHY,
      {
        [QueryParams.HIDE_INFO]: true,
        [QueryParams.GEO_VIEW_FILTER]: topicView.geoView,
      },
    )
    return this.uriService.getImageDownloadDefinitions(
      exportUrl,
      topicView.topic,
      `${RoutePaths.SHARE_GEOGRAPHY}_${topicView.geoView}`,
      this.lang,
    )
  }

  private getOverviewTweetArgs(overviewData: OverviewDataV4): TextArgs {
    return {
      ...this.defaultArgs(overviewData.covidCase),
      ...Object.entries(overviewData.covidCase.dailyValues).reduce(reduceWithPrefix('case'), {}),
      ...Object.entries(overviewData.covidDeath.dailyValues).reduce(reduceWithPrefix('death'), {}),
      ...Object.entries(overviewData.covidHosp.dailyValues).reduce(reduceWithPrefix('hosp'), {}),
      ...Object.entries(overviewData.covidTest.dailyValues[GdiSubset.TEST_ALL]).reduce(reduceWithPrefix('test'), {}),
      ...Object.entries(overviewData.covidRe.dailyValues).reduce(reduceWithPrefix('re'), {}),
      ...Object.entries(overviewData.hospCapacity.dailyValues[GdiObject.HOSP_CAPACITY_ICU]).reduce(
        reduceWithPrefix('capIcu'),
        {},
      ),
    }
  }

  private getVaccineTweetArgs({ covidVacc }: OverviewDataV4): TextArgs {
    return {
      ...this.defaultArgs(covidVacc),
      ...Object.entries(covidVacc.dailyValues[GdiSubset.VACC_DOSES_RECEIVED]).reduce(reduceWithPrefix('received'), {}),
      ...Object.entries(covidVacc.dailyValues[GdiSubset.VACC_DOSES_DELIV]).reduce(reduceWithPrefix('delivered'), {}),
      ...Object.entries(covidVacc.dailyValues[GdiSubset.VACC_DOSES_ADMIN]).reduce(reduceWithPrefix('administered'), {}),
      ...Object.entries(covidVacc.dailyValues[GdiSubset.VACC_PERSONS_FULL]).reduce(reduceWithPrefix('personsFull'), {}),
      ...Object.entries(covidVacc.dailyValues[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE]).reduce(
        reduceWithPrefix('personsMinOneDose'),
        {},
      ),
      ...Object.entries(covidVacc.dailyValues[GdiSubset.VACC_PERSONS_PARTIAL]).reduce(
        reduceWithPrefix('personsPartial'),
        {},
      ),
      ...Object.entries(covidVacc.dailyValues[GdiSubset.VACC_PERSONS_FIRST_BOOSTER]).reduce(
        reduceWithPrefix('personsFirstBooster'),
        {},
      ),
    }
  }

  private defaultArgs(cardData: OverviewCardV3<any, any, any>): TextArgs {
    const dayDelta = cardData.deltaDay ?? '???'
    const prevDayName =
      dayDelta > 0 ? formatUtcDate(addDays(new Date(cardData.sourceDate), -dayDelta), 'EEEE', this.locale) : '???'
    return {
      dateShort: formatUtcDate(new Date(cardData.sourceDate), 'dd.MM.'),
      dateFull: formatUtcDate(new Date(cardData.sourceDate), 'dd.MM.yyyy'),
      prevDayName,
      diffDays: dayDelta,
      diffHours: typeof dayDelta === 'number' ? dayDelta * 24 : '???',
    }
  }
}
