import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { isDefined } from '@c19/commons'

export interface CompareData {
  entries: CompareEntry[]
  ref1?: number | null
  ref2?: number | null
}

export interface CompareEntry {
  label: string
  set1: TableRowSetValues
  set2: TableRowSetValues
  diff: number | null
}

export interface TableRowSetValues {
  rel: number | null
  abs: number | null
}

interface ExtTableRowSetValues extends TableRowSetValues {
  barWidth: number | null
}

export interface ExtCompareEntry extends CompareEntry {
  set1: ExtTableRowSetValues
  set2: ExtTableRowSetValues
  diffIcon: null | 'decr' | 'same' | 'incr'
}

@Component({
  selector: 'bag-weekly-compare-table',
  templateUrl: './weekly-compare-table.component.html',
  styleUrls: ['./weekly-compare-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyCompareTableComponent {
  @Input()
  val0Header: string

  @Input()
  val1Header: string

  @Input()
  diffHeader: string

  @Input()
  set data(value: CompareData) {
    this._data = value
    const maxRelVal = this.isModePercentage
      ? 100
      : Math.max(...value.entries.reduce<number[]>((u, i) => [...u, i.set1.rel || 0, i.set2.rel || 0], []))

    this.entries = value.entries.map(({ label, set1, set2, diff }) => {
      return {
        label,
        diff,
        diffIcon: isDefined(diff)
          ? this.isModePercentage
            ? diff >= 1
              ? 'incr'
              : diff < -1
              ? 'decr'
              : 'same'
            : diff >= 5
            ? 'incr'
            : diff < -5
            ? 'decr'
            : 'same'
          : null,
        set1: { ...set1, barWidth: set1.rel ? (set1.rel / maxRelVal) * 100 : 0 },
        set2: { ...set2, barWidth: set2.rel ? (set2.rel / maxRelVal) * 100 : 0 },
      }
    })
    this.ref1w = value.ref1 ? (value.ref1 / maxRelVal) * 100 : null
    this.ref2w = value.ref2 ? (value.ref2 / maxRelVal) * 100 : null
  }

  get data() {
    return this._data
  }

  @Input()
  iconThreshold = 10

  @Input()
  promoteFirstN = 3

  @Input()
  set mode(val: 'inz' | 'percentage') {
    this._mode = val
    this.isModePercentage = val === 'percentage'
    this.relToFixed = this.isModePercentage ? 1 : 2
    this.relSuffix = this.isModePercentage ? '%' : undefined
  }

  get mode() {
    return this._mode
  }

  isModePercentage: boolean
  relToFixed: number | undefined
  relSuffix: string | undefined

  entries: ExtCompareEntry[]

  ref1w: number | null

  ref2w: number | null

  private _data: CompareData
  private _mode: 'inz' | 'percentage' = 'inz'

  readonly identifyRowItem = (index: number, item: ExtCompareEntry) => item.label
}
