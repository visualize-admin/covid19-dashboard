import { ChangeDetectionStrategy, Component } from '@angular/core'
import { EpidemiologicVaccDosesGeographyData, EpidemiologicVaccPersonsGeoData } from '@c19/commons'
import { ExtendedGeoFeatureCollection } from '../../../../diagrams/choropleth/base-choropleth.component'
import { RouteDataKey } from '../../../route-data-key.enum'
import { ShareVaccinationBaseComponent } from '../share-vaccination-base.component'

@Component({
  selector: 'bag-share-vaccination-geography',
  templateUrl: './share-vaccination-geography.component.html',
  styleUrls: ['../share-vaccination-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareVaccinationGeographyComponent extends ShareVaccinationBaseComponent<
  EpidemiologicVaccDosesGeographyData | EpidemiologicVaccPersonsGeoData
> {
  readonly chflGeoJson: ExtendedGeoFeatureCollection = this.route.snapshot.data[RouteDataKey.GEO_JSON]

  // ng template check does not work correctly so we need getters for casting
  get dosesData(): EpidemiologicVaccDosesGeographyData {
    // casting would be removed from tslint. therefore ts-ignore is used
    // @ts-ignore
    return this.data
  }

  // ng template check does not work correctly so we need getters for casting
  get personsData(): EpidemiologicVaccPersonsGeoData {
    // casting would be removed from tslint. therefore ts-ignore is used
    // @ts-ignore
    return this.data
  }
}
