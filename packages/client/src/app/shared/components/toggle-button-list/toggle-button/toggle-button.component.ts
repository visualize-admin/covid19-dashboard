import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { TOGGLE_BUTTON_LIST, ToggleButtonListComponent } from '../toggle-button-list.component'
import { ToggleButtonChange } from './toggle-button-change.model'

let _uniqueIdCounter = 0

@Component({
  selector: 'bag-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleButtonComponent implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('class.toggle-button') hostClass = true
  // Always reset the tabindex to -1 so it doesn't conflict with the one on the `button`,
  // but can still receive focus from things like cdkFocusInitial.
  @HostBinding('attr.tabindex') hostTabIndex = -1

  /**
   * Attached to the aria-label attribute of the host element. In most cases, aria-labelledby will
   * take precedence so this may be omitted.
   */
  @Input('aria-label') ariaLabel: string

  /**
   * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
   */
  @Input('aria-labelledby') ariaLabelledby: string | null = null

  @ViewChild('button') _buttonElement: ElementRef<HTMLButtonElement>

  /** The parent button toggle group (exclusive selection). Optional. */
  toggleButtonList: ToggleButtonListComponent

  @HostBinding('class.toggle-button--standalone') standalone: boolean

  /** Unique ID for the underlying `button` element. */
  get buttonId(): string {
    return `${this.id}-button`
  }

  /** The unique ID for this button toggle. */
  @HostBinding('attr.id')
  @Input()
  id: string

  /** HTML's 'name' attribute used to group radios for unique selection. */
  @HostBinding('attr.name')
  @Input()
  name: string

  /** ToggleButtonListComponent reads this to assign its own value. */
  @Input() value: any

  /** Whether the button is checked. */
  @HostBinding('class.toggle-button--checked')
  @Input()
  get checked(): boolean {
    return this.toggleButtonList ? this.toggleButtonList._isSelected(this) : this._checked
  }

  set checked(value: boolean) {
    const newValue = coerceBooleanProperty(value)

    if (newValue !== this._checked) {
      this._checked = newValue

      if (this.toggleButtonList) {
        this.toggleButtonList._syncButtonToggle(this, this._checked)
      }

      this._changeDetectorRef.markForCheck()
    }
  }

  /** Whether the button is disabled. */
  @HostBinding('class.toggle-button--disabled')
  @Input()
  get disabled(): boolean {
    return this._disabled || (this.toggleButtonList && this.toggleButtonList.disabled)
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value)
  }

  get focused(): boolean {
    return this._focused
  }

  /** Event emitted when the group value changes. */
  @Output() readonly change: EventEmitter<ToggleButtonChange> = new EventEmitter<ToggleButtonChange>()

  private _disabled = false
  private _checked = false
  private _focused = false
  private readonly onDestroy = new Subject<void>()

  constructor(
    @Optional() @Inject(TOGGLE_BUTTON_LIST) toggleGroup: ToggleButtonListComponent,
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef<HTMLElement>,
    private _focusMonitor: FocusMonitor,
  ) {
    this.toggleButtonList = toggleGroup
  }

  ngOnInit() {
    const group = this.toggleButtonList
    this.id = this.id || `bag-toggle-button-${_uniqueIdCounter++}`

    if (group) {
      this.name = group.name
      if (group._isPrechecked(this)) {
        this.checked = true
      } else if (group._isSelected(this) !== this._checked) {
        // As as side effect of the circular dependency between the toggle group and the button,
        // we may end up in a state where the button is supposed to be checked on init, but it
        // isn't, because the checked value was assigned too early. This can happen when Ivy
        // assigns the static input value before the `ngOnInit` has run.
        group._syncButtonToggle(this, this._checked)
      }
    } else {
      this.standalone = true
    }
  }

  ngAfterViewInit() {
    this._focusMonitor
      .monitor(this._elementRef, true)
      .pipe(takeUntil(this.onDestroy))
      .subscribe((o: FocusOrigin) => (this._focused = !!o))
  }

  ngOnDestroy() {
    this.onDestroy.next()
    this.onDestroy.complete()

    const group = this.toggleButtonList

    this._focusMonitor.stopMonitoring(this._elementRef)

    // Remove the toggle from the selection once it's destroyed. Needs to happen
    // on the next tick in order to avoid "changed after checked" errors.
    if (group && group._isSelected(this)) {
      group._syncButtonToggle(this, false, false, true)
    }
  }

  /** Focuses the button. */
  @HostListener('focus')
  focus(options?: FocusOptions): void {
    this._buttonElement.nativeElement.focus(options)
  }

  /** Checks the button toggle due to an interaction with the underlying native button. */
  _onButtonClick() {
    const newChecked = true

    if (newChecked !== this._checked) {
      this._checked = newChecked
      if (this.toggleButtonList) {
        this.toggleButtonList._syncButtonToggle(this, this._checked, true)
        this.toggleButtonList._onTouched()
      }
    }
    // Emit a change event when it's the single selector
    this.change.emit(new ToggleButtonChange(this, this.value))
  }

  /**
   * Marks the button toggle as needing checking for change detection.
   * This method is exposed because the parent button toggle group will directly
   * update bound properties of the radio button.
   */
  _markForCheck() {
    // When the group value changes, the button will not be notified.
    // Use `markForCheck` to explicit update button toggle's status.
    this._changeDetectorRef.markForCheck()
  }
}
