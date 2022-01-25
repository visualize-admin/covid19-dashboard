import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { isDefined } from '@c19/commons'
import { clamp } from '../../../static-utils/clamp.function'

@Component({
  selector: 'bag-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeSliderComponent),
      multi: true,
    },
  ],
})
export class RangeSliderComponent implements ControlValueAccessor {
  @Input() labelKey: string

  @Input() titleTxt: string

  @Input() descTxt: string

  @Input() min = 0

  @Input() max: number

  @Input() value: number

  @Output() readonly valueChange = new EventEmitter<number>()

  @ViewChild('inputElRef', { static: true, read: ElementRef })
  inputElRef: ElementRef<HTMLInputElement>

  readonly step = 1

  get itemWidth(): number {
    return 100 / ((this.max - this.min) / this.step + 1)
  }

  get relVal(): number {
    const val = (isDefined(this.value) ? this.value - this.min : 0) / (this.max - this.min)
    return clamp(0, 1, val)
  }

  get position(): number {
    const iw = this.itemWidth
    return this.relVal * (100 - iw) + iw / 2
  }

  constructor() {}

  sliderValueChanged(event: Event) {
    const target = <HTMLInputElement>event.target
    this.setEmitNewValue(parseInt(target.value, 10))
  }

  onContentClick(event: MouseEvent) {
    const target = <HTMLElement>event.target
    const p = event.offsetX / target.offsetWidth
    const val = this.min + (this.max - this.min) * p
    const rounded = Math.round(val / this.step) * this.step
    this.setEmitNewValue(rounded)
    this.inputElRef.nativeElement.focus({ preventScroll: true })
  }

  // Implemented as part of ControlValueAccessor.
  writeValue(value: number): void {
    this.value = value
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: number) => {}): void {
    this.onChange = fn
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn
  }

  /** `View -> model callback called when autocomplete has been touched` */
  private onTouched: () => void = () => {}

  /** `View -> model callback called when value changes` */
  private onChange: (value: any) => void = (value: number) => {}

  private setEmitNewValue(value: number) {
    this.value = value
    this.valueChange.next(value)
    this.onTouched()
    this.onChange(value)
  }
}
