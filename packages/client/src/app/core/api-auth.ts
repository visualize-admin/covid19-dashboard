import { FactoryProvider, InjectionToken } from '@angular/core'
import { WindowRef } from '@shiftcode/ngx-core'

export const API_AUTH = new InjectionToken<string | null>('API_AUTH')

export const LS_KEY_API_AUTH = 'DATA_ENDPOINT_AUTH'

export function apiAuthBrowserFactory(winRef: WindowRef): string | null {
  return winRef.nativeWindow?.localStorage.getItem(LS_KEY_API_AUTH) ?? null
}

export const API_AUTH_BROWSER_PROVIDER: FactoryProvider = {
  provide: API_AUTH,
  useFactory: apiAuthBrowserFactory,
  deps: [WindowRef],
}
