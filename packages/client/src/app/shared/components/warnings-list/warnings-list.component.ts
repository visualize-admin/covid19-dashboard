import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'

export enum WarningSeverity {
  ZERO = 0,
  LOW = 1,
  MED = 2,
  HIGH = 3,
}

export interface WarningsItem {
  severity: WarningSeverity
  label: string
  info?: string | undefined
  group?: string
}

@Component({
  selector: 'bag-warnings-list',
  templateUrl: './warnings-list.component.html',
  styleUrls: ['./warnings-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarningsListComponent {
  @Input()
  title?: string

  @Input()
  entries: WarningsItem[]

  readonly WarningSeverity = WarningSeverity
}
