import { Inject, Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { LoggerService } from '@shiftcode/ngx-core'
import { QueryParams } from '../shared/models/query-params.enum'
import { BASE_RUNTIME_CONFIG, BaseRuntimeConfig } from './base-runtime-config.token'
import { TranslationsLoaderService } from './i18n/translations-loader.service'
import { TranslatorService } from './i18n/translator.service'
import { SeoMeta } from './meta/seo-meta.type'

@Injectable({ providedIn: 'root' })
export class DefaultSeoMetaResolver implements Resolve<SeoMeta> {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly translationsLoader: TranslationsLoaderService,
    @Inject(BASE_RUNTIME_CONFIG) private readonly baseRuntimeConfig: BaseRuntimeConfig,
  ) {}

  async resolve(snapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<SeoMeta> {
    const showKeys = snapshot.queryParamMap.get(QueryParams.SHOW_I18N_KEYS) === 'true'
    const translations = await this.translationsLoader.translations
    const translator = new TranslatorService(
      this.loggerService,
      translations,
      showKeys && !this.baseRuntimeConfig.productionFlag,
    )
    return <SeoMeta>{
      title: translator.get('Commons.SEO.Title'),
      description: translator.get('Commons.SEO.Description'),
      type: 'website',
    }
  }
}
