import {
  Component,
  EventEmitter,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input,
  Output,
  forwardRef,
  ChangeDetectorRef,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { OptionsDef } from '../../models/option-def.type'

@Component({
  selector: 'bag-single-select',
  templateUrl: './single-select.component.html',
  styleUrls: ['./single-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'bagSingleSelect',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SingleSelectComponent),
      multi: true,
    },
  ],
})
export class SingleSelectComponent<T> implements ControlValueAccessor {
  @Input()
  labelKey: string

  @Input()
  options: OptionsDef<T | null>

  @Input()
  value: T | null

  @Output()
  readonly valueChange = new EventEmitter<T | null>()

  get valueLabelKey(): string {
    return this.options.find((o) => o.val === this.value)?.key || ''
  }

  constructor(private readonly cd: ChangeDetectorRef) {}

  onSelectValueChanged(ev: Event) {
    const select = <HTMLSelectElement>ev.target
    this.value = this.options[select.options.selectedIndex].val
    this.onTouched()
    this.onChange(this.value)
    this.valueChange.emit(this.value)
  }

  writeValue(value: T | null): void {
    this.value = value
    this.cd.markForCheck()
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
  private onChange: (value: T | null) => void = (value) => {}
}
