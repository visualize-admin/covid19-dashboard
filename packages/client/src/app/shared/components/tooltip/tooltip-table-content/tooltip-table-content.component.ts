import { ChangeDetectionStrategy, Component, TrackByFunction, ViewEncapsulation } from '@angular/core'
import { formatUtcDate } from '../../../../static-utils/date-utils'
import { BaseTooltipContentComponent } from '../base-tooltip-content.component'

export interface TooltipTableContentEntryCol {
  value: string | null
  color?: string
  type?: 'square' | 'line' | 'mean' | 'refMean'
  dashed?: boolean
  pattern?: boolean
}

export interface TooltipTableContentEntry {
  key: string
  color?: string
  col1: TooltipTableContentEntryCol
  col2: TooltipTableContentEntryCol
  lighten?: boolean
}

export interface TooltipTableContentData<T extends TooltipTableContentEntry = TooltipTableContentEntry> {
  /** either the title text (not key) or a Date */
  title: string | Date

  col1Key?: string | null
  col1LabelHidden?: boolean
  col1Hidden?: boolean
  col1Bold?: boolean

  col2Key?: string | null
  col2Hidden?: boolean
  col2Bold?: boolean
  entries?: T[] | null
  footer?: T[] | null

  noDataKey?: string | null
}

@Component({
  selector: 'bag-tooltip-table-content',
  templateUrl: './tooltip-table-content.component.html',
  styleUrls: ['./tooltip-table-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipTableContentComponent extends BaseTooltipContentComponent<TooltipTableContentData> {
  get hasLabelColor(): boolean {
    return this.data.entries?.some((e) => !!e.color) || false
  }

  get withCol1(): boolean {
    return !this.data.col1Hidden
  }

  get withCol2(): boolean {
    return !this.data.col2Hidden
  }

  get has1stColColor(): boolean {
    return this.data.entries?.some((e) => !!e.col1.color) || false
  }

  get has2ndColColor(): boolean {
    return this.data.entries?.some((e) => !!e.col2.color) || false
  }

  get noData(): boolean {
    return !this.data.entries?.length && !this.data.footer
  }

  get hasFoot(): boolean {
    return !!this.data.footer && this.data.footer.length > 0
  }

  get title(): string {
    return this.data.title instanceof Date ? formatUtcDate(this.data.title) : this.data.title
  }

  get noDataKey(): string {
    return this.data.noDataKey || 'Commons.NoData'
  }

  readonly identifyRowItem: TrackByFunction<TooltipTableContentEntry> = (
    ix: number,
    e: TooltipTableContentEntry,
  ): string => {
    return e.key
  }
}
