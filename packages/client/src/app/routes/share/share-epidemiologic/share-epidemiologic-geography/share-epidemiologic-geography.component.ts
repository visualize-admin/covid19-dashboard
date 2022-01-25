import { ChangeDetectionStrategy, Component } from '@angular/core'
import { EpidemiologicGeographyData, EpidemiologicTestGeographyData } from '@c19/commons'
import { ExtendedGeoFeatureCollection } from '../../../../diagrams/choropleth/base-choropleth.component'
import { RouteDataKey } from '../../../route-data-key.enum'
import { ShareEpidemiologicBaseComponent } from '../share-epidemiologic-base.component'

@Component({
  selector: 'bag-share-epidemiologic-geography',
  template: `
    <bag-detail-card-epidemiologic-geography
      [facet]="facet"
      [data]="data"
      [geoJson]="chflGeoJson"
      [infoAddOnKey]="introKeyEpi"
      [hideInfo]="hideInfo"
    ></bag-detail-card-epidemiologic-geography>
  `,
  styleUrls: ['../share-epidemiologic-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareEpidemiologicGeographyComponent extends ShareEpidemiologicBaseComponent<
  EpidemiologicGeographyData | EpidemiologicTestGeographyData
> {
  readonly chflGeoJson: ExtendedGeoFeatureCollection = this.route.snapshot.data[RouteDataKey.GEO_JSON]
}
