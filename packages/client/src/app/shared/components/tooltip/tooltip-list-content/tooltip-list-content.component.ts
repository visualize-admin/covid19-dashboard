import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { BaseTooltipContentComponent } from '../base-tooltip-content.component'

export interface TooltipListContentEntry {
  label: string
  value: string
  color?: string | null
  type?: 'square' | 'line' | 'mean' | 'refMean' | 'diagLine'
  lighten?: boolean
  borderBelow?: boolean
  pattern?: boolean
  dashed?: boolean
}

export interface TooltipListContentData<T extends TooltipListContentEntry = TooltipListContentEntry> {
  title?: string
  date?: string

  noData?: boolean
  noCase?: boolean
  noCaseKey?: string

  entries?: T[]
}

@Component({
  selector: 'bag-tooltip-list-content',
  templateUrl: './tooltip-list-content.component.html',
  styleUrls: ['./tooltip-list-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipListContentComponent extends BaseTooltipContentComponent<TooltipListContentData> {
  get showEntries(): boolean {
    return !this.data.noData && !this.data.noCase && !!this.data.entries && this.data.entries.length > 0
  }
}
