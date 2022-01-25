import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { PaginatorContentDirective } from './paginator-content.directive'

@Component({
  selector: 'bag-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PaginatorComponent),
      multi: true,
    },
  ],
})
export class PaginatorComponent implements ControlValueAccessor {
  @ContentChild(PaginatorContentDirective)
  paginatorContent: PaginatorContentDirective

  @Input() max: number

  @Input() min = 0

  @Input() step = 1

  @Input() value: number
  @Output() readonly valueChange = new EventEmitter<number>()

  get prevDisabled(): boolean {
    return this.value <= this.min
  }

  get nextDisabled(): boolean {
    return this.value >= this.max
  }

  onBtnClick(ev: UIEvent, change: number) {
    this.emitValueChange(this.value + change)
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: number) => {}): void {
    this.onChange = fn
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn
  }

  // Implemented as part of ControlValueAccessor.
  writeValue(val: number): void {
    this.value = val
  }

  private onChange: (value: number) => void = (value: any) => {}
  private onTouched: () => void = () => {}

  private emitValueChange(newValue: number) {
    this.value = newValue
    this.onTouched()
    this.onChange(newValue)
    this.valueChange.emit(newValue)
  }
}
