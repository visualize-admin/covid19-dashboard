import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { InternationComparisonDailyValues } from '@c19/commons'

@Component({
  selector: 'bag-geo-unit-int-cases-data',
  templateUrl: './geo-unit-int-cases-data.component.html',
  styleUrls: ['./geo-unit-int-cases-data.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoUnitIntCasesDataComponent {
  @Input()
  title: string

  @Input()
  data: InternationComparisonDailyValues

  @Input()
  dataCh: InternationComparisonDailyValues | null

  @Input()
  isTooltip?: boolean
}
