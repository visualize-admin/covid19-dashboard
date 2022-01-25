import { ChangeDetectionStrategy, Component } from '@angular/core'
import { HospCapacityGeographyData } from '@c19/commons'
import { ExtendedGeoFeatureCollection } from '../../../../diagrams/choropleth/base-choropleth.component'
import { RouteDataKey } from '../../../route-data-key.enum'
import { ShareHospCapacityBaseComponent } from '../share-hosp-capacity-base.component'

@Component({
  template: `
    <bag-detail-card-capacity-geography
      [facet]="isExport ? 'print' : null"
      [data]="data"
      [infoAddOnKey]="introKey"
      [geoJson]="chflGeoJson"
      [hideInfo]="hideInfo"
    ></bag-detail-card-capacity-geography>
  `,
  styleUrls: ['../share-hosp-capacity-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareHospCapacityGeographyComponent extends ShareHospCapacityBaseComponent<HospCapacityGeographyData> {
  readonly chflGeoJson: ExtendedGeoFeatureCollection = this.route.snapshot.data[RouteDataKey.GEO_JSON]
}
