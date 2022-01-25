import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { SelectionModel } from '@angular/cdk/collections'
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  InjectionToken,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewEncapsulation,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { ToggleButtonChange } from './toggle-button/toggle-button-change.model'
import { ToggleButtonComponent } from './toggle-button/toggle-button.component'

let _uniqueIdCounter = 0

export const TOGGLE_BUTTON_LIST = new InjectionToken<ToggleButtonListComponent>('ToggleButtonListComponent')

/**
 * Provider Expression that allows bag-toggle-button-list to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 */
export const TOGGLE_BUTTON_LIST_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ToggleButtonListComponent),
  multi: true,
}

@Component({
  selector: 'bag-toggle-button-list',
  providers: [
    TOGGLE_BUTTON_LIST_VALUE_ACCESSOR,
    { provide: TOGGLE_BUTTON_LIST, useExisting: ToggleButtonListComponent },
  ],
  templateUrl: './toggle-button-list.component.html',
  styleUrls: ['./toggle-button-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleButtonListComponent implements ControlValueAccessor, OnInit, AfterContentInit {
  @HostBinding('class.toggle-button-list') hostClass = true

  /** Child button toggle buttons. */
  @ContentChildren(forwardRef(() => ToggleButtonComponent), {
    // Note that this would technically pick up toggles
    // from nested groups, but that's not a case that we support.
    descendants: true,
  })
  _buttonToggles: QueryList<ToggleButtonComponent>

  /** `name` attribute for the underlying `input` element. */
  @Input()
  get name(): string {
    return this._name
  }

  set name(value: string) {
    this._name = value

    if (this._buttonToggles) {
      this._buttonToggles.forEach((toggle) => {
        toggle.name = this._name
        toggle._markForCheck()
      })
    }
  }

  /** Value of the toggle group. */
  @Input()
  get value(): any {
    const selected = this._selectionModel ? this._selectionModel.selected : []
    return selected[0] ? selected[0].value : undefined
  }

  set value(newValue: any) {
    this._setSelectionByValue(newValue)
    this.valueChange.emit(this.value)
  }

  /**
   * Event that emits whenever the value of the group changes.
   * Used to facilitate two-way data binding.
   * @docs-private
   */
  @Output() readonly valueChange = new EventEmitter<any>()

  /** Selected button toggles in the group. */
  get selected(): ToggleButtonComponent | null {
    const selected = this._selectionModel ? this._selectionModel.selected : []
    return selected[0] || null
  }

  /** Whether multiple button toggle group is disabled. */
  @HostBinding('attr.aria-disabled')
  @Input()
  get disabled(): boolean {
    return this._disabled
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value)

    if (this._buttonToggles) {
      this._buttonToggles.forEach((toggle) => toggle._markForCheck())
    }
  }

  /** Event emitted when the group's value changes. */
  @Output() readonly change: EventEmitter<ToggleButtonChange> = new EventEmitter<ToggleButtonChange>()

  private _name = `bag-toggle-button-list-${_uniqueIdCounter++}`
  private _disabled = false
  private _selectionModel: SelectionModel<ToggleButtonComponent>
  /**
   * Reference to the raw value that the consumer tried to assign. The real
   * value will exclude any values from this one that don't correspond to a
   * toggle. Useful for the cases where the value is assigned before the toggles
   * have been initialized or at the same that they're being swapped out.
   */
  private _rawValue: any

  constructor(private _changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    this._selectionModel = new SelectionModel<ToggleButtonComponent>(false, undefined, false)
  }

  ngAfterContentInit() {
    this._selectionModel.select(...this._buttonToggles.filter((toggle) => toggle.checked))
  }

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value Value to be set to the model.
   */
  writeValue(value: any) {
    this.value = value
    this._changeDetector.markForCheck()
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: any) {
    this._onTouched = fn
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  @HostListener('keydown', ['$event'])
  onKeydown(ev: KeyboardEvent): void {
    const mod: number =
      ev.code === 'ArrowLeft' || ev.code === 'ArrowUp'
        ? -1
        : ev.code === 'ArrowRight' || ev.code === 'ArrowDown'
        ? 1
        : 0
    if (mod) {
      const currentFocusedIx = this._buttonToggles.toArray().findIndex((b) => b.focused)
      if (currentFocusedIx !== -1) {
        const ix = (currentFocusedIx + this._buttonToggles.length + mod) % this._buttonToggles.length
        this._buttonToggles.get(ix)?.focus()
        ev.preventDefault()
      }
    }
  }

  /** Dispatch change event with current selection and group value. */
  _emitChangeEvent(): void {
    const selected = this.selected
    if (selected) {
      const source = Array.isArray(selected) ? selected[selected.length - 1] : selected
      const event = new ToggleButtonChange(source, this.value)
      this._controlValueAccessorChangeFn(event.value)
      this.change.emit(event)
    }
  }

  /**
   * Syncs a button toggle's selected state with the model value.
   * @param toggle Toggle to be synced.
   * @param select Whether the toggle should be selected.
   * @param isUserInput Whether the change was a result of a user interaction.
   * @param deferEvents Whether to defer emitting the change events.
   */
  _syncButtonToggle(toggle: ToggleButtonComponent, select: boolean, isUserInput = false, deferEvents = false) {
    // Deselect the currently-selected toggle, if we're in single-selection
    // mode and the button being toggled isn't selected at the moment.
    if (this.selected && !toggle.checked) {
      this.selected.checked = false
    }

    if (this._selectionModel) {
      if (select) {
        this._selectionModel.select(toggle)
      } else {
        this._selectionModel.deselect(toggle)
      }
    } else {
      deferEvents = true
    }

    // We need to defer in some cases in order to avoid "changed after checked errors", however
    // the side-effect is that we may end up updating the model value out of sequence in others
    // The `deferEvents` flag allows us to decide whether to do it on a case-by-case basis.
    if (deferEvents) {
      Promise.resolve().then(() => this._updateModelValue(isUserInput))
    } else {
      this._updateModelValue(isUserInput)
    }
  }

  /** Checks whether a button toggle is selected. */
  _isSelected(toggle: ToggleButtonComponent) {
    return this._selectionModel && this._selectionModel.isSelected(toggle)
  }

  /** Determines whether a button toggle should be checked on init. */
  _isPrechecked(toggle: ToggleButtonComponent) {
    if (typeof this._rawValue === 'undefined') {
      return false
    }

    return toggle.value === this._rawValue
  }

  /**
   * The method to be called in order to update ngModel.
   * Now `ngModel` binding is not supported in multiple selection mode.
   */
  _controlValueAccessorChangeFn: (value: any) => void = () => {}

  /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
  _onTouched: () => any = () => {}

  /** Updates the selection state of the toggles in the group based on a value. */
  private _setSelectionByValue(value: any | any[]) {
    this._rawValue = value

    if (!this._buttonToggles) {
      return
    }

    this._clearSelection()
    this._selectValue(value)
  }

  /** Clears the selected toggles. */
  private _clearSelection() {
    this._selectionModel.clear()
    this._buttonToggles.forEach((toggle) => (toggle.checked = false))
  }

  /** Selects a value if there's a toggle that corresponds to it. */
  private _selectValue(value: any) {
    const correspondingOption = this._buttonToggles.find((toggle) => {
      return toggle.value !== undefined && toggle.value === value // support null value
    })

    if (correspondingOption) {
      correspondingOption.checked = true
      this._selectionModel.select(correspondingOption)
    }
  }

  /** Syncs up the group's value with the model and emits the change event. */
  private _updateModelValue(isUserInput: boolean) {
    // Only emit the change event for user input.
    if (isUserInput) {
      this._emitChangeEvent()
    }

    // Note: we emit this one no matter whether it was a user interaction, because
    // it is used by Angular to sync up the two-way data binding.
    this.valueChange.emit(this.value)
  }
}
