import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'select[bag-select]',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./native-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '[class.bag-native-select]': 'true',
  },
})
export class NativeSelectComponent {}
