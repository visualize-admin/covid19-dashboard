import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { EpidemiologicVaccPersonsGeoValues, GdiSubset } from '@c19/commons'
import { DistributionBarEntries } from '../../../diagrams/distribution-bar/distribution-bar.component'
import {
  COLOR_VACC_PERSONS_BOOSTER_PATTERN,
  COLOR_VACC_PERSONS_FULL,
  COLOR_VACC_PERSONS_MIN_ONE,
  COLOR_VACC_PERSONS_NOT_VACCINATED,
} from '../../../shared/commons/colors.const'

interface GeoUnitVaccPersonsData {
  minOneDose: number | null
  booster: {
    color: string
    patternColor: string
    inzTotal: number | null
    total: number | null
  }
  full: {
    color: string
    inzTotal: number | null
    total: number | null
  }
  partial: {
    color: string
    inzTotal: number | null
    total: number | null
  }
}

export interface AdditionalInfoBoxItem {
  title: string
  full: {
    inzTotal: number | null
    total: number | null
  }
  partial: {
    inzTotal: number | null
    total: number | null
  }
  minOne: {
    inzTotal: number | null
    total: number | null
  }
  booster: {
    inzTotal: number | null
    total: number | null
  }
}

@Component({
  selector: 'bag-geo-unit-vacc-persons-data',
  templateUrl: './geo-unit-vacc-persons-data.component.html',
  styleUrls: ['./geo-unit-vacc-persons-data.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoUnitVaccPersonsDataComponent {
  @Input()
  title: string

  @Input()
  subTitle: string

  @Input()
  isTooltip?: boolean

  @Input()
  data: EpidemiologicVaccPersonsGeoValues

  @Input()
  additionalItems?: AdditionalInfoBoxItem[]

  get preparedData(): GeoUnitVaccPersonsData | null {
    if (this.data) {
      return {
        minOneDose: this.data[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].inzTotal,
        booster: {
          color: COLOR_VACC_PERSONS_FULL,
          patternColor: COLOR_VACC_PERSONS_BOOSTER_PATTERN,
          inzTotal: this.data[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].inzTotal,
          total: this.data[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].total,
        },
        full: {
          color: COLOR_VACC_PERSONS_FULL,
          inzTotal: this.data[GdiSubset.VACC_PERSONS_FULL].inzTotal,
          total: this.data[GdiSubset.VACC_PERSONS_FULL].total,
        },
        partial: {
          color: COLOR_VACC_PERSONS_MIN_ONE,
          inzTotal: this.data[GdiSubset.VACC_PERSONS_PARTIAL].inzTotal,
          total: this.data[GdiSubset.VACC_PERSONS_PARTIAL].total,
        },
      }
    } else {
      return null
    }
  }

  get distribution(): DistributionBarEntries {
    const full = this.data[GdiSubset.VACC_PERSONS_FULL].inzTotal
    const partial = this.data[GdiSubset.VACC_PERSONS_PARTIAL].inzTotal
    const minOne = this.data[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].inzTotal
    const booster = this.data[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].inzTotal
    return [
      {
        ratio: booster,
        colorCode: COLOR_VACC_PERSONS_FULL,
        patternColorCode: COLOR_VACC_PERSONS_BOOSTER_PATTERN,
        isOverlay: true,
      },
      { ratio: full, colorCode: COLOR_VACC_PERSONS_FULL },
      { ratio: partial, colorCode: COLOR_VACC_PERSONS_MIN_ONE },
      { ratio: 100 - (minOne || 0), colorCode: COLOR_VACC_PERSONS_NOT_VACCINATED },
    ]
  }
}
