import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'

export interface WeeklyReportInfoBoxData {
  week1: string
  week2: string
  total: number
  week: number
  prev: number
  totalInz: number
  weekInz: number
  prevInz: number
}

@Component({
  selector: 'bag-weekly-report-info-box-data',
  templateUrl: './weekly-report-info-box-data.component.html',
  styleUrls: ['./weekly-report-info-box-data.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportInfoBoxDataComponent {
  @Input()
  titleAbsKey = 'WeeklyReport.Card.InfoBox.Absolute'

  @Input()
  titleRelKey = 'WeeklyReport.Card.InfoBox.Inz100K'

  @Input()
  totalKey = 'WeeklyReport.Card.InfoBox.Total'

  @Input()
  data: WeeklyReportInfoBoxData
}
