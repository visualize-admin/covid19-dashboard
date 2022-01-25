import { OverlayRef } from '@angular/cdk/overlay'
import { Observable, Subject } from 'rxjs'

export class DownloadModalRef {
  readonly close$: Observable<void>
  private readonly closeSubject = new Subject<void>()

  constructor(private readonly overlayRef: OverlayRef) {
    this.close$ = this.closeSubject.asObservable()
  }

  readonly close = () => {
    this.overlayRef.detachBackdrop()
    this.closeSubject.next()
    this.closeSubject.complete()
    this.overlayRef.dispose()
  }
}
