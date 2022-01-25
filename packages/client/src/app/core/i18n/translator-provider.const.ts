import { StaticProvider } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { LoggerService } from '@shiftcode/ngx-core'
import { RouteDataKey } from '../../routes/route-data-key.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { BASE_RUNTIME_CONFIG, BaseRuntimeConfig } from '../base-runtime-config.token'
import { TranslatorService } from './translator.service'

export const TRANSLATOR_PROVIDER: StaticProvider = {
  provide: TranslatorService,
  useFactory: (loggerService: LoggerService, { snapshot }: ActivatedRoute, baseRuntimeConfig: BaseRuntimeConfig) =>
    new TranslatorService(
      loggerService,
      snapshot.data[RouteDataKey.TRANSLATIONS],
      !baseRuntimeConfig.productionFlag && snapshot.queryParamMap.get(QueryParams.SHOW_I18N_KEYS) === 'true',
    ),
  deps: [LoggerService, ActivatedRoute, BASE_RUNTIME_CONFIG],
}
