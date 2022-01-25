import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'

export interface KeyValueListEntry {
  key?: string
  keyDescription?: string
  info?: string
  value?: string
  colorCode?: string
  combineAbove?: boolean
  combineBelow?: boolean
  combineAboveNoBorder?: boolean
  isTitle?: boolean
  pattern?: boolean
}

export type KeyValueListEntries = KeyValueListEntry[]

@Component({
  selector: 'bag-key-value-list',
  templateUrl: './key-value-list.component.html',
  styleUrls: ['./key-value-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyValueListComponent {
  @Input()
  data: KeyValueListEntry[]

  @Input()
  captionKey?: string

  @Input()
  showInfo?: boolean

  readonly identifyRowItem = (ix: number, row: KeyValueListEntry): string => `${ix}_${row.key}`
}
