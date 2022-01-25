import { Platform } from '@angular/cdk/platform'
import { Injectable, OnDestroy } from '@angular/core'
import { setup, WindowRef } from '@shiftcode/ngx-core'
import { NEVER, Observable, Subject } from 'rxjs'
import { filter, finalize } from 'rxjs/operators'
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer'

@Injectable({ providedIn: 'root' })
export class ResizeService implements OnDestroy {
  private readonly observer: ResizeObserver | null
  private readonly eventSubject = new Subject<ResizeObserverEntry>()

  constructor(windowRef: WindowRef, platform: Platform) {
    if (platform.isBrowser && windowRef.nativeWindow) {
      const RO = windowRef.nativeWindow.ResizeObserver || ResizeObserverPolyfill
      this.observer = new RO(this.onResize)
    } else {
      this.observer = null
    }
  }

  observe(element: Element): Observable<any> {
    if (this.observer) {
      return this.eventSubject.asObservable().pipe(
        // setup fn called when subscribed
        setup(() => this.observer?.observe(element)),
        filter((ev) => ev.target === element),
        // finalize fn called when completed
        finalize(() => this.observer?.unobserve(element)),
      )
    } else {
      return NEVER
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }

  private readonly onResize: ResizeObserverCallback = (entries) => {
    entries.map((entry) => this.eventSubject.next(entry))
  }
}
