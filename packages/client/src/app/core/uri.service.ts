import { HttpParams } from '@angular/common/http'
import { Inject, Injectable, LOCALE_ID } from '@angular/core'
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router'
import { API_PATH, API_DATA_PATH, API_RENDERER_PATH, Language } from '@c19/commons'
import { ORIGIN } from '@shiftcode/ngx-core'
import { firstValueFrom } from 'rxjs'
import { ImageDownloadUrls } from '../cards-epidemiologic/base-detail-epidemiologic-card.component'
import { RoutePaths } from '../routes/route-paths.enum'
import { QueryParams } from '../shared/models/query-params.enum'
import { TimeSlotFilter } from '../shared/models/filters/time-slot-filter.enum'
import { formatUtcDate } from '../static-utils/date-utils'
import { DataService } from './data/data.service'
import { CURRENT_LANG } from './i18n/language.token'

interface RendererOptions {
  awaitEvent: string
  viewportWidth: number
  viewportHeight: number
}

@Injectable({ providedIn: 'root' })
export class UriService {
  static readonly API_DATA = `/${API_PATH}/${API_DATA_PATH}`
  static readonly API_RENDERER = `/${API_PATH}/${API_RENDERER_PATH}`

  static createQueryParamsAddon(
    route: ActivatedRouteSnapshot,
    deleteForceStateParam: boolean = true,
    additionalParams: Record<string, string | boolean | number> = {},
  ): string {
    const queryParams = { ...route.queryParams, ...additionalParams }

    delete queryParams[QueryParams.FORCE_DATA_STATE]

    return Object.keys(queryParams).length ? `?${new HttpParams({ fromObject: queryParams }).toString()}` : ''
  }

  private static dataDownloadUri = (version: string, type: string) =>
    `${UriService.API_DATA}/${version}/downloads/sources-${type}.zip`

  private static rendererUri(format: 'pdf' | 'png' | 'jpeg', url: string, options: Partial<RendererOptions> = {}) {
    const params = { url, ...options }
    const queryParamStr = Object.entries(params)
      .filter((keyVal): keyVal is [string, number | string] => !!keyVal[1])
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
    return `${UriService.API_RENDERER}/${format}?${queryParamStr}`
  }

  constructor(
    @Inject(ORIGIN) private readonly origin: string,
    @Inject(LOCALE_ID) readonly locale: string,
    @Inject(CURRENT_LANG) private readonly lang: Language,
    private readonly dataService: DataService,
    private readonly route: ActivatedRoute,
  ) {}

  async getDownloadDefinitions() {
    const dataContext = await firstValueFrom(this.dataService.context$)
    const formattedDate = formatUtcDate(new Date(dataContext.sourceDate), 'dd_MMMM_yyyy', this.locale)
    return {
      sourceDate: formattedDate,
      report: {
        pdf28days: UriService.rendererUri(
          'pdf',
          `${this.origin}/${this.lang}/${RoutePaths.EXPORT}/${RoutePaths.EXPORT_REPORT}?${QueryParams.FORCE_DATA_STATE}=${dataContext.dataVersion}&${QueryParams.TIME_FILTER}=${TimeSlotFilter.LAST_4_WEEKS}`,
        ),
        pdf14days: UriService.rendererUri(
          'pdf',
          `${this.origin}/${this.lang}/${RoutePaths.EXPORT}/${RoutePaths.EXPORT_REPORT}?${QueryParams.FORCE_DATA_STATE}=${dataContext.dataVersion}&${QueryParams.TIME_FILTER}=${TimeSlotFilter.LAST_2_WEEKS}`,
        ),
      },
      data: {
        json: {
          url: UriService.dataDownloadUri(dataContext.dataVersion, 'json'),
          filename: `bag_covid_19_data_json_${formattedDate}.zip`,
        },
        csv: {
          url: UriService.dataDownloadUri(dataContext.dataVersion, 'csv'),
          filename: `bag_covid_19_data_csv_${formattedDate}.zip`,
        },
      },
    } as const
  }

  async getImageDownloadDefinitions(
    url: string,
    gdi: string,
    cardType: string,
    lang: string | null = null,
    rendererOptions: Partial<RendererOptions> = {},
  ): Promise<ImageDownloadUrls> {
    const dataContext = await firstValueFrom(this.dataService.context$)
    const formattedDate = formatUtcDate(new Date(dataContext.sourceDate), 'dd_MMMM_yyyy', this.locale)
    const dataStateParam = `${QueryParams.FORCE_DATA_STATE}=${dataContext.dataVersion}`
    const qpSplit = url.includes('?') ? '&' : '?'
    const fileName = `bag_covid_19_${gdi}_${cardType}_${formattedDate}${lang ? '.' + lang : ''}`
    return {
      png: {
        url: UriService.rendererUri('png', [url, dataStateParam].join(qpSplit), rendererOptions),
        filename: `${fileName}.png`,
      },
      jpeg: {
        url: UriService.rendererUri('jpeg', [url, dataStateParam].join(qpSplit), rendererOptions),
        filename: `${fileName}.jpeg`,
      },
    }
  }

  createShareUrl(basePath: string, cardType: string, extraParams?: Record<string, boolean | number | string>) {
    return this.createDetailUrl(basePath, cardType, false, extraParams)
  }

  createExportUrl(basePath: string, cardType: string, extraParams?: Record<string, boolean | number | string>) {
    return this.createDetailUrl(basePath, cardType, true, extraParams)
  }

  createDetailUrl(
    basePath: string,
    cardType: string,
    forExport: boolean,
    extraParams: Record<string, boolean | number | string> = {},
  ): string {
    const queryParams = UriService.createQueryParamsAddon(
      this.route.snapshot,
      forExport,
      forExport ? { ...extraParams, [QueryParams.IS_EXPORT]: true } : {},
    )
    const pathParts = [this.origin, this.lang, basePath, RoutePaths.DETAIL, cardType]
    return `${pathParts.join('/')}${queryParams}`
  }
}
