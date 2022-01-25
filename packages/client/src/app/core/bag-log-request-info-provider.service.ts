import { Injectable } from '@angular/core'
import { LogRequestInfoProvider, WindowRef } from '@shiftcode/ngx-core'

@Injectable({ providedIn: 'root' })
export class BagLogRequestInfoProviderService extends LogRequestInfoProvider {
  private readonly window: Window | null

  constructor(windowRef: WindowRef) {
    super()
    this.window = windowRef.nativeWindow
  }

  getRequestInfo(): Record<string, string> {
    return {
      userAgent: this.window?.navigator.userAgent || 'n/a',
      path: this.window?.location ? `${location.pathname}${location.search}${location.hash}` : 'n/a',
    }
  }
}
