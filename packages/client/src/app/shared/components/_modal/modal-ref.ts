import { OverlayRef } from '@angular/cdk/overlay'
import { Observable, Subject } from 'rxjs'

export interface ModalResult<T = never> {
  focusSelf: boolean
  result?: T
}

export interface ModalChange<T = never> {
  result?: T
}

export class ModalRef<T = never> {
  readonly close$: Observable<ModalResult<T>>
  readonly change$: Observable<ModalChange<T>>

  private readonly closeSubject = new Subject<ModalResult<T>>()
  private readonly changeSubject = new Subject<ModalChange<T>>()

  constructor(private readonly overlayRef: OverlayRef) {
    this.close$ = this.closeSubject.asObservable()
    this.change$ = this.changeSubject.asObservable()
  }

  readonly change = (value: ModalChange<T>) => {
    this.changeSubject.next(value)
  }

  readonly close = (value: ModalResult<T>) => {
    this.overlayRef.detachBackdrop()
    this.closeSubject.next(value)
    this.closeSubject.complete()
    this.changeSubject.complete()
    this.overlayRef.dispose()
  }
}
