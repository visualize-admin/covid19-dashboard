import { InjectionToken } from '@angular/core'

export interface BaseRuntimeConfig {
  stage: string
  region: string
  productionFlag: boolean
  pullRequestFlag: boolean
}

export const BASE_RUNTIME_CONFIG = new InjectionToken<BaseRuntimeConfig>('BASE_RUNTIME_CONFIG')
