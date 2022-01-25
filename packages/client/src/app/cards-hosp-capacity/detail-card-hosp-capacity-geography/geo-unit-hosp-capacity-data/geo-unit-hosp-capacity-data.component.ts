import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { HospCapacityGeoValues, InlineValues } from '@c19/commons'
import { DistributionBarEntries } from '../../../diagrams/distribution-bar/distribution-bar.component'
import {
  COLOR_HOSP_CAP_COVID,
  COLOR_HOSP_CAP_FREE,
  COLOR_HOSP_CAP_NON_COVID,
  COLORS_HOSP_CAP_BARS,
} from '../../../shared/commons/colors.const'

@Component({
  selector: 'bag-geo-unit-hosp-capacity-data',
  templateUrl: './geo-unit-hosp-capacity-data.component.html',
  styleUrls: ['./geo-unit-hosp-capacity-data.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoUnitHospCapacityDataComponent {
  @Input()
  title: string

  @Input()
  noneText?: string | null

  @Input()
  data: InlineValues<HospCapacityGeoValues>

  @Input()
  covidOnly: boolean

  @Input()
  isTooltip?: boolean

  readonly colors = COLORS_HOSP_CAP_BARS

  get distribution(): DistributionBarEntries {
    return [
      { ratio: this.data.percentage_hospBedsCovid, colorCode: COLOR_HOSP_CAP_COVID },
      { ratio: this.data.percentage_hospBedsNonCovid, colorCode: COLOR_HOSP_CAP_NON_COVID },
      { ratio: this.data.percentage_hospBedsFree, colorCode: COLOR_HOSP_CAP_FREE },
    ]
  }
}
