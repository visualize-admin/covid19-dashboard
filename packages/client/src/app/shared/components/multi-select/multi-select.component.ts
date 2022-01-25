import { Overlay, OverlayConfig, OverlayPositionBuilder } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { DOCUMENT } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  Inject,
  Injector,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { NavigationEnd, Router } from '@angular/router'
import { filterIfInstanceOf } from '@shiftcode/ngx-core'
import { fromEvent, merge, Observable, ReplaySubject } from 'rxjs'
import { map, mapTo, takeUntil } from 'rxjs/operators'
import { ModalChange, ModalRef, ModalResult } from '../_modal/modal-ref'
import { scrollThreshold$ } from '../../../static-utils/scroll-threshold-observable.function'
import { MODAL_DATA } from '../_modal/modal-data.token'
import { MODAL_REF } from '../_modal/modal-ref.token'
import { MultiSelectModalComponent, MultiSelectModalData } from './multi-select-modal/multi-select-modal.component'
import { MultiSelectOption } from './multi-select-option.type'

@Component({
  selector: 'bag-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'bagMultiSelect',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent<T extends MultiSelectOption> implements ControlValueAccessor {
  @Input()
  options: T[]

  @Input()
  noneSelectedLabel: string

  @Input()
  allSelectedLabel: string

  @Input()
  labelFn?: (value: T[]) => string

  @ViewChild('btnElRef')
  btnElRef: ElementRef

  readonly selectedOptions$: Observable<T[]>
  readonly selectedLabel$: Observable<string>

  private ref: ModalRef<T[]> | null = null
  private value: T[] = []
  private readonly selectedOptionSubject = new ReplaySubject<T[]>(1)

  constructor(
    readonly elRef: ElementRef,
    private readonly overlay: Overlay,
    private readonly router: Router,
    private readonly injector: Injector,
    private overlayPositionBuilder: OverlayPositionBuilder,
    @Inject(DOCUMENT) private readonly doc: Document,
  ) {
    this.selectedOptions$ = this.selectedOptionSubject.asObservable()
    this.selectedLabel$ = this.selectedOptions$.pipe(
      map((values) => (this.labelFn ? this.labelFn(values) : this._getLabel(values))),
    )
  }

  readonly toggle = () => {
    if (this.ref) {
      this.ref.close({ focusSelf: false })
    } else {
      this.open()
    }
  }

  readonly open = () => {
    if (this.ref) {
      return
    }
    const overlayRef = this.overlay.create(this.getOverlayConfig())
    const ref = new ModalRef<T[]>(overlayRef)

    const data: MultiSelectModalData<T> = {
      options: this.options,
      selected: this.value,
    }

    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: MODAL_REF, useValue: ref },
        { provide: MODAL_DATA, useValue: data },
      ],
    })

    const containerPortal = new ComponentPortal(MultiSelectModalComponent, undefined, injector)
    overlayRef.attach(containerPortal)

    // auto-close conditions
    merge(
      fromEvent(window, 'orientationchange'),
      scrollThreshold$(this.doc, 100),
      overlayRef.outsidePointerEvents(),
      this.router.events.pipe(filterIfInstanceOf(NavigationEnd)),
    )
      .pipe(takeUntil(ref.close$), mapTo({ focusSelf: false }))
      .subscribe(ref.close)

    ref.change$.subscribe(this.onChanged)
    ref.close$.subscribe(this.afterClosed)

    this.ref = ref
  }

  writeValue(value: T[]): void {
    this.value = Array.isArray(value) ? value : []
    this.selectedOptionSubject.next(this.value)
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => {}): void {
    this.onChange = fn
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn
  }

  /** `View -> model callback called when autocomplete has been touched` */
  private onTouched: () => void = () => {}

  /** `View -> model callback called when value changes` */
  private onChange: (value: any) => void = (value: any) => {}

  private readonly onChanged = (modalChange: ModalChange<T[]>) => {
    if (modalChange.result) {
      this.value = modalChange.result
      this.onTouched()
      this.onChange(this.value)
      this.selectedOptionSubject.next(modalChange.result)
    }
  }

  private readonly afterClosed = (modalResult: ModalResult<T[]>) => {
    this.ref = null
    if (modalResult.focusSelf) {
      this.btnElRef?.nativeElement.focus()
    }
  }

  private getOverlayConfig(): OverlayConfig {
    // test whether mobile or not
    const positionStrategy = this.overlayPositionBuilder.flexibleConnectedTo(this.elRef).withPositions([
      {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
      },
    ])

    const scrollStrategy = this.overlay.scrollStrategies.reposition()

    return new OverlayConfig({
      disposeOnNavigation: true,
      hasBackdrop: false,
      scrollStrategy,
      positionStrategy,
    })
  }

  private readonly _getLabel = (value: T[]) => {
    return value.length === 0
      ? this.noneSelectedLabel
      : value.length === this.options.length
      ? this.allSelectedLabel
      : value.map((o) => o.label).join(',')
  }
}
