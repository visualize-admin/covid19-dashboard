import { Platform } from '@angular/cdk/platform'
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms'
import { Subject } from 'rxjs'
import { takeUntil, tap } from 'rxjs/operators'
import { AppComponent } from '../../../app.component'
import { DOM_ID } from '../../../static-utils/dom-id.const'
import { emitValToOwnViewFn } from '../../../static-utils/emit-value-to-own-view.function'
import { throttleFn } from '../../../static-utils/throttle-fn.function'
import { NavBoardService } from '../header/nav-board/nav-board.service'
import { SearchFilterOptionGroup } from '../search-filter/search-filter-options.type'
import { SearchFilterComponent } from '../search-filter/search-filter.component'

@Component({
  selector: 'bag-select-title',
  templateUrl: './select-title.component.html',
  styleUrls: ['./select-title.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectTitleComponent),
      multi: true,
    },
  ],
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '[attr.id]': `'${DOM_ID.STICKY_HEADER}'`,
  },
})
export class SelectTitleComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input()
  optionGroups: SearchFilterOptionGroup[]

  @Input()
  noGrouping: boolean

  @Input()
  facet?: 'noBorder'

  @Input()
  hideComma = false

  @Input()
  titleKey: string

  @Input()
  filterLabelKey = 'GeoFilter.Label'

  @Input()
  resetFilterKey: string

  @Input()
  useFullWidthShadow: boolean | null

  @ViewChild(SearchFilterComponent, { static: true })
  searchFilter: SearchFilterComponent

  @ViewChild('titleElRef', { read: ElementRef, static: true })
  readonly titleElRef: ElementRef<HTMLElement>

  readonly control = new FormControl()

  readonly element: HTMLElement

  @HostBinding('style.--title-height-offset.px')
  get titleHeightOffset(): number {
    if (this.platform.isBrowser && this.titleElRef && this.titleElRef.nativeElement) {
      const height = this.titleElRef.nativeElement.getBoundingClientRect().height
      return height === 72 ? -36 : 0
    }
    return 0
  }

  // without the throttle, the svg-animation breaks on double-clicks
  readonly toggleNavBoard = throttleFn(this._toggleNavBoard.bind(this), 250)

  private readonly onDestroy = new Subject<void>()

  constructor(
    elementRef: ElementRef,
    private readonly injector: Injector,
    readonly navBoardService: NavBoardService,
    private platform: Platform,
    private readonly appRef: ApplicationRef,
  ) {
    this.element = elementRef.nativeElement
    this.control.valueChanges
      .pipe(takeUntil(this.onDestroy), tap<string | null>(emitValToOwnViewFn(this.control)))
      .subscribe(this.onValueChange)
  }

  reset() {
    this.writeValue(null)
    this.onValueChange(null)
  }

  ngOnInit() {
    const rootComponent: AppComponent | undefined = this.appRef.components[0]?.instance
    this.searchFilter.selectedOption$.pipe(takeUntil(this.onDestroy)).subscribe((val) => {
      rootComponent?.setStyleProperty('--sticky-detail-filter-reset-enabled', `${val.value === null ? 0 : 1}`)
    })
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: string | null) => {}): void {
    this.onChange = fn
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn
  }

  writeValue(val: string | null): void {
    this.control.setValue(val, { onlySelf: true, emitEvent: false, emitModelToViewChange: true })
  }

  private onChange: (value: string | null) => void = (value: any) => {}
  private onTouched: () => void = () => {}

  private readonly onValueChange = (v: string | null) => {
    this.onTouched()
    this.onChange(v)
  }

  private _toggleNavBoard() {
    this.navBoardService.toggle(this.injector)
  }
}
