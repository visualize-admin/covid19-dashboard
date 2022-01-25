import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { formatUtcDate } from '../../../static-utils/date-utils'

export interface RowBarChartEntry {
  label: string
  value: string
  ratio: number | null
}

export type RowBarChartEntries = RowBarChartEntry[]

@Component({
  selector: 'bag-row-bar-chart',
  templateUrl: './row-bar-chart.component.html',
  styleUrls: ['./row-bar-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowBarChartComponent {
  @Input()
  maxLabelLength: number

  @Input()
  maxValueLength: number

  @Input()
  domainMax: number

  @Input()
  titleKey = 'Commons.DateToDate'

  @Input()
  entries: RowBarChartEntries

  @Input()
  dates: [Date, Date]

  get titleArgs() {
    return {
      date1: formatUtcDate(this.dates[0]),
      date2: formatUtcDate(this.dates[1]),
    }
  }

  constructor() {}
}
