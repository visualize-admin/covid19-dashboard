import { ENTER, hasModifierKey, SPACE } from '@angular/cdk/keycodes'
import { Overlay, OverlayConfig, OverlayPositionBuilder } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { DOCUMENT } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  forwardRef,
  HostListener,
  Inject,
  Injector,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { NavigationEnd, Router } from '@angular/router'
import { filterIfInstanceOf } from '@shiftcode/ngx-core'
import { BehaviorSubject, fromEvent, merge, Observable, ReplaySubject } from 'rxjs'
import { filter, map, mapTo, takeUntil } from 'rxjs/operators'
import { isElChildOf } from '../../../static-utils/is-el-child-of.function'
import { scrollThreshold$ } from '../../../static-utils/scroll-threshold-observable.function'
import { MODAL_DATA } from '../_modal/modal-data.token'
import { ModalRef, ModalResult } from '../_modal/modal-ref'
import { MODAL_REF } from '../_modal/modal-ref.token'
import { SearchFilterOption, SearchFilterOptionGroup } from './search-filter-options.type'
import { SearchListModalComponent, SearchListModalData } from './search-list-modal/search-list-modal.component'

@Component({
  selector: 'bag-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'bagGeoSearchFilter',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchFilterComponent),
      multi: true,
    },
  ],
})
export class SearchFilterComponent implements ControlValueAccessor {
  @Input()
  fileDescription: string

  @Input()
  iconUrl?: string

  @Input()
  groupedOptions: SearchFilterOptionGroup[]

  @Input()
  noGrouping?: boolean

  @ViewChild('btnElRef')
  btnElRef: ElementRef

  readonly isOpen$: Observable<boolean>
  readonly selectedLabel$: Observable<string>
  readonly selectedOption$: Observable<SearchFilterOption>

  private ref: ModalRef<SearchFilterOption> | null = null

  private value: any

  private readonly selectedOptionSubject = new ReplaySubject<SearchFilterOption>(1)
  private readonly isOpenSubject = new BehaviorSubject<boolean>(false)

  constructor(
    private readonly overlay: Overlay,
    private readonly router: Router,
    readonly elRef: ElementRef,
    @Inject(DOCUMENT) private readonly doc: Document,
    private overlayPositionBuilder: OverlayPositionBuilder,
    private readonly injector: Injector,
  ) {
    this.selectedOption$ = this.selectedOptionSubject.asObservable()
    this.selectedLabel$ = this.selectedOption$.pipe(map((opt) => opt.label))
    this.isOpen$ = this.isOpenSubject.asObservable()
  }

  readonly toggle = () => {
    if (this.ref) {
      this.ref.close({ focusSelf: false })
    } else {
      this.open()
    }
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => {}): void {
    this.onChange = fn
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn
  }

  writeValue(obj: string | number | null): void {
    this.value = obj
    this.selectedOptionSubject.next(this.getOptionFromVal(obj))
  }

  /** Ensures the search filter is opened when activated from the keyboard. */
  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if ((event.keyCode === ENTER || event.keyCode === SPACE) && !hasModifierKey(event)) {
      this.toggle()
      event.preventDefault()
    }
  }

  private readonly open = () => {
    const data: SearchListModalData = {
      selected: this.value,
      groups: this.groupedOptions,
      fileDescription: this.fileDescription,
      noGrouping: this.noGrouping,
    }

    const overlayRef = this.overlay.create(this.getOverlayConfig())
    const ref = new ModalRef<SearchFilterOption>(overlayRef)

    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: MODAL_REF, useValue: ref },
        { provide: MODAL_DATA, useValue: data },
      ],
    })
    const containerPortal = new ComponentPortal(SearchListModalComponent, null, injector)
    const componentRef: ComponentRef<SearchListModalComponent> = overlayRef.attach(containerPortal)

    setTimeout(() => {
      merge(
        fromEvent<MouseEvent>(this.doc, 'click').pipe(
          filter((ev) => isElChildOf(<HTMLElement>ev.target, componentRef.instance.element)),
        ),
        fromEvent(window, 'orientationchange'),
        scrollThreshold$(this.doc, 100),
      )
        .pipe(mapTo(<ModalResult>{ focusSelf: false }), takeUntil(ref.close$))
        .subscribe(ref.close)
    })

    this.router.events
      .pipe(takeUntil(ref.close$), filterIfInstanceOf(NavigationEnd), mapTo(<ModalResult>{ focusSelf: false }))
      .subscribe(ref.close)

    ref.close$.subscribe(this.afterClosed)
    this.ref = ref
    this.isOpenSubject.next(true)
  }

  private readonly afterClosed = (modalResult: ModalResult<SearchFilterOption>) => {
    this.ref = null
    this.isOpenSubject.next(false)
    if (modalResult.result) {
      this.value = modalResult.result.value
      this.onTouched()
      this.onChange(this.value)
      this.selectedOptionSubject.next(modalResult.result)
    }
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

    return new OverlayConfig({ hasBackdrop: false, scrollStrategy, positionStrategy })
  }

  /** `View -> model callback called when value changes` */
  private onChange: (value: any) => void = (value: any) => {}

  /** `View -> model callback called when autocomplete has been touched` */
  private onTouched: () => void = () => {}

  private getOptionFromVal(val: string | number | null): SearchFilterOption {
    for (const grp of this.groupedOptions) {
      for (const opt of grp.options) {
        if (val === opt.value) {
          return opt
        }
      }
    }
    throw new Error(`the provided value ${val} does not exist as an option`)
  }
}
