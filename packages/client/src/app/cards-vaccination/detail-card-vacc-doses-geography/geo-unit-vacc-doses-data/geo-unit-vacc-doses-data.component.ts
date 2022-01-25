import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { EpidemiologicVaccDosesDailyGeoValues } from '@c19/commons'

@Component({
  selector: 'bag-geo-unit-vacc-doses-data',
  templateUrl: './geo-unit-vacc-doses-data.component.html',
  styleUrls: ['./geo-unit-vacc-doses-data.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoUnitVaccDosesDataComponent {
  @Input()
  title: string

  @Input()
  data: EpidemiologicVaccDosesDailyGeoValues

  @Input()
  additionalData?: EpidemiologicVaccDosesDailyGeoValues | null

  @Input()
  lowlight = false

  @Input()
  isTooltip?: boolean
}
