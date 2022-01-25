import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ReGeography } from '@c19/commons'
import { ExtendedGeoFeatureCollection } from '../../../../diagrams/choropleth/base-choropleth.component'
import { RouteDataKey } from '../../../route-data-key.enum'
import { ShareReproBaseComponent } from '../share-repro-base.component'

@Component({
  template: `
    <bag-detail-card-repro-geography
      [infoAddOnKey]="infoAddOnKey"
      [shareMode]="true"
      [facet]="facet"
      [data]="data"
      [geoJson]="chflGeoJson"
    >
    </bag-detail-card-repro-geography>
  `,
  styleUrls: ['../share-repro-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareReproGeographyComponent extends ShareReproBaseComponent<ReGeography> {
  readonly chflGeoJson: ExtendedGeoFeatureCollection = this.route.snapshot.data[RouteDataKey.GEO_JSON]
}
