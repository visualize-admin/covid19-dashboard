import { FactoryProvider, InjectionToken, Optional } from '@angular/core'
import { WindowRef } from '@shiftcode/ngx-core'
import { API_AUTH, LS_KEY_API_AUTH } from './api-auth'
import { BASE_RUNTIME_CONFIG, BaseRuntimeConfig } from './base-runtime-config.token'

export interface RequestOptions {
  withCredentials?: boolean
  headers?: Record<string, string>
}

export const REQUEST_OPTIONS = new InjectionToken<RequestOptions>('REQUEST_OPTIONS')

function browserRequestOptionsProvider(
  baseRuntimeConfig: BaseRuntimeConfig,
  winRef: WindowRef,
  apiAuth?: string,
): RequestOptions {
  if (baseRuntimeConfig.productionFlag) {
    return {}
  }
  const hostname = winRef.nativeWindow?.location.hostname ?? ''
  // also support tunnels to localhost with browserstack (bs-local.com) and ngrok
  if (['localhost', 'bs-local.com'].includes(hostname) || hostname?.endsWith('.ngrok.io')) {
    if (apiAuth) {
      return { headers: { authorization: apiAuth } }
    } else {
      // tslint:disable-next-line:no-console
      console.warn(`Local Storage item ${LS_KEY_API_AUTH} not set.`)
      return {}
    }
  } else {
    return { withCredentials: true }
  }
}

export const BROWSER_REQUEST_OPTIONS_PROVIDER: FactoryProvider = {
  provide: REQUEST_OPTIONS,
  useFactory: browserRequestOptionsProvider,
  deps: [BASE_RUNTIME_CONFIG, WindowRef, [new Optional(), API_AUTH]],
}

function serverRequestOptionsProvider(baseRuntimeConfig: BaseRuntimeConfig, apiAuth?: string): RequestOptions {
  if (!baseRuntimeConfig.productionFlag && apiAuth) {
    return { headers: { authorization: apiAuth } }
  }
  return {}
}

export const SERVER_REQUEST_OPTIONS_PROVIDER: FactoryProvider = {
  provide: REQUEST_OPTIONS,
  useFactory: serverRequestOptionsProvider,
  deps: [BASE_RUNTIME_CONFIG, [new Optional(), API_AUTH]],
}
