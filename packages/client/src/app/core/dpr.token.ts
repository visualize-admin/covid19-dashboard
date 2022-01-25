import { InjectionToken } from '@angular/core'
import { WindowRef } from '@shiftcode/ngx-core'

export const DPR = new InjectionToken<number>('DEVICE_PIXEL_RATIO', {
  providedIn: 'root',
  factory: () => 1,
})

export function dprFactory(windowRef: WindowRef) {
  return windowRef.nativeWindow?.devicePixelRatio ?? 1
}
