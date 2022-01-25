import { coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  InjectionToken,
  Input,
  ViewEncapsulation,
} from '@angular/core'

// Counter for unique group ids.
let _uniqueOptgroupIdCounter = 0

/**
 * Injection token that can be used to reference instances of `OptionGroupComponent`. It serves as
 * alternative token to the actual `OptionGroupComponent` class which could cause unnecessary
 * retention of the class and its component metadata.
 */
export const OPTION_GROUP = new InjectionToken<OptionGroupComponent>('OptionGroupComponent')

/**
 * Component that is used to group instances of `mat-option`.
 */
@Component({
  selector: 'bag-option-group',
  exportAs: 'bagOptionGroup',
  templateUrl: 'option-group.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['option-group.component.scss'],
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    role: 'group',
  },
  providers: [{ provide: OPTION_GROUP, useExisting: OptionGroupComponent }],
})
export class OptionGroupComponent {
  /** Label for the option group. */
  @Input() label: string

  /** Whether the option is disabled. */
  @HostBinding('attr.aria-disabled')
  @HostBinding('class.option-group--disabled')
  @Input()
  get disabled() {
    return this._disabled
  }

  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value)
  }

  /** Unique id for the underlying label. */
  @HostBinding('attr.aria-labelledby')
  labelId = `bag-option-group-label-${_uniqueOptgroupIdCounter++}`

  private _disabled = false
}
