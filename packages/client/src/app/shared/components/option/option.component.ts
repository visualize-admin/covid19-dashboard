import { FocusableOption, FocusOptions, FocusOrigin } from '@angular/cdk/a11y'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { ENTER, hasModifierKey, SPACE } from '@angular/cdk/keycodes'
import {
  AfterViewChecked,
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
  Optional,
  Output,
  ViewEncapsulation,
} from '@angular/core'
import { isDefined } from '@c19/commons'
import { Subject } from 'rxjs'
import { OPTION_GROUP, OptionGroupComponent } from './option-group.component'
import { OptionSelectionChange } from './option-selection-change.model'

/**
 * Option IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let _uniqueIdCounter = 0

/**
 * Single option inside of a `<mat-select>` element.
 */
@Component({
  selector: 'bag-option',
  exportAs: 'bagOption',
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    role: 'option',
  },
  styleUrls: ['option.component.scss'],
  templateUrl: 'option.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionComponent implements FocusableOption, AfterViewChecked, OnDestroy {
  /** Whether or not the option is currently selected. */
  @Input()
  get selected(): boolean {
    return this._selected
  }

  set selected(value: boolean) {
    this._selected = coerceBooleanProperty(value)
  }

  /** Whether or not the selected option label is colored. Default is false. */
  @Input()
  get noSelectionColor(): boolean {
    return this._noSelectionColor
  }

  set noSelectionColor(value: boolean) {
    this._noSelectionColor = coerceBooleanProperty(value)
  }

  @Input()
  forMulti: boolean

  /** The form value of the option. */
  @Input() value: any

  /** The unique ID of the option. */
  @HostBinding('id')
  @Input()
  id = `bag-option-${_uniqueIdCounter++}`

  /** Whether the option is disabled. */
  @HostBinding('attr.aria-disabled')
  @Input()
  get disabled() {
    return (this.group && this.group.disabled) || this._disabled
  }

  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value)
  }

  @Input()
  tabIndex?: number | null

  /**
   * Gets the `aria-selected` value for the option. We explicitly omit the `aria-selected`
   * attribute from single-selection, unselected options. Including the `aria-selected="false"`
   * attributes adds a significant amount of noise to screen-reader users without providing useful
   * information.
   */
  @HostBinding('attr.aria-selected')
  get getAriaSelected(): boolean {
    return this.selected
  }

  /** Returns the correct tabindex for the option depending on disabled state. */
  @HostBinding('attr.tabindex')
  get getTabIndex(): string {
    return this.disabled ? '-1' : isDefined(this.tabIndex) ? `${this.tabIndex}` : '-1'
  }

  /** Event emitted when the option is selected or deselected. */
  @Output() readonly selectionChange = new EventEmitter<OptionSelectionChange>()

  /** Emits when the state of the option changes and any parents have to be notified. */
  readonly _stateChanges = new Subject<void>()

  private _noSelectionColor = false
  private _selected = false
  private _active = false
  private _disabled = false
  private _mostRecentViewValue = ''

  constructor(
    private readonly element: ElementRef<HTMLElement>,
    private readonly changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(OPTION_GROUP) private readonly group: OptionGroupComponent,
  ) {}

  /**
   * Whether or not the option is currently active and ready to be selected.
   * An active option displays styles as if it is focused, but the
   * focus is actually retained somewhere else. This comes in handy
   * for components like autocomplete where focus must remain on the input.
   */
  get active(): boolean {
    return this._active
  }

  /**
   * The displayed value of the option. It is necessary to show the selected option in the
   * select's trigger.
   */
  get viewValue(): string {
    return (this.getHostElement().textContent || '').trim()
  }

  /** Selects the option. */
  select(): void {
    if (!this._selected) {
      this._selected = true
      this.changeDetectorRef.markForCheck()
      this._emitSelectionChangeEvent()
    }
  }

  /** Deselects the option. */
  deselect(): void {
    if (this._selected) {
      this._selected = false
      this.changeDetectorRef.markForCheck()
      this._emitSelectionChangeEvent()
    }
  }

  /** Sets focus onto this option. */
  focus(_origin?: FocusOrigin, options?: FocusOptions): void {
    // Note that we aren't using `_origin`, but we need to keep it because some internal consumers
    // use `OptionComponent` in a `FocusKeyManager` and we need it to match `FocusableOption`.
    const element = this.getHostElement()

    if (typeof element.focus === 'function') {
      element.focus(options)
    }
  }

  /**
   * This method sets display styles on the option to make it appear
   * active. This is used by the ActiveDescendantKeyManager so key
   * events will display the proper options as active on arrow key events.
   */
  setActiveStyles(): void {
    if (!this._active) {
      this._active = true
      this.changeDetectorRef.markForCheck()
    }
  }

  /**
   * This method removes display styles on the option that made it appear
   * active. This is used by the ActiveDescendantKeyManager so key
   * events will display the proper options as active on arrow key events.
   */
  setInactiveStyles(): void {
    if (this._active) {
      this._active = false
      this.changeDetectorRef.markForCheck()
    }
  }

  /** Gets the label to be used when determining whether the option should be focused. */
  getLabel(): string {
    return this.viewValue
  }

  /** Ensures the option is selected when activated from the keyboard. */
  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if ((event.keyCode === ENTER || event.keyCode === SPACE) && !hasModifierKey(event)) {
      this.selectViaInteraction()

      // Prevent the page from scrolling down and form submits.
      event.preventDefault()
    }
  }

  /**
   * `Selects the option while indicating the selection came from the user. Used to
   * determine if the select's view -> model callback should be invoked.`
   */
  @HostListener('click')
  selectViaInteraction(): void {
    if (!this.disabled) {
      this._selected = true
      this.changeDetectorRef.markForCheck()
      this._emitSelectionChangeEvent(true)
    }
  }

  /** Gets the host DOM element. */
  getHostElement(): HTMLElement {
    return this.element.nativeElement
  }

  ngAfterViewChecked() {
    // Since parent components could be using the option's label to display the selected values
    // (e.g. `mat-select`) and they don't have a way of knowing if the option's label has changed
    // we have to check for changes in the DOM ourselves and dispatch an event. These checks are
    // relatively cheap, however we still limit them only to selected options in order to avoid
    // hitting the DOM too often.
    if (this._selected) {
      const viewValue = this.viewValue

      if (viewValue !== this._mostRecentViewValue) {
        this._mostRecentViewValue = viewValue
        this._stateChanges.next()
      }
    }
  }

  ngOnDestroy() {
    this._stateChanges.complete()
  }

  /** Emits the selection change event. */
  private _emitSelectionChangeEvent(isUserInput = false): void {
    this.selectionChange.emit(new OptionSelectionChange(this, isUserInput))
  }
}
