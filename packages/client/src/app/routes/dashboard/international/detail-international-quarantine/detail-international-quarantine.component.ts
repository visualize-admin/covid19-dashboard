import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { InternationalQuarantineData } from '@c19/commons'
import { ExtendedGeoFeatureCollection } from '../../../../diagrams/choropleth/base-choropleth.component'
import { RouteDataKey } from '../../../route-data-key.enum'
import { InternationalCombinedData } from '../international-combined-data.type'

@Component({
  selector: 'bag-detail-international-quarantine',
  templateUrl: './detail-international-quarantine.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailInternationalQuarantineComponent {
  // tslint:disable-next-line:no-non-null-assertion
  readonly worldGeoJson: ExtendedGeoFeatureCollection = this.route.parent!.snapshot.data[RouteDataKey.GEO_JSON]

  readonly quarantineGeoData: InternationalQuarantineData

  constructor(protected route: ActivatedRoute) {
    // tslint:disable-next-line:no-non-null-assertion
    const data: InternationalCombinedData = this.route.parent!.snapshot.data[RouteDataKey.DETAIL_DATA]
    this.quarantineGeoData = data.quarantine
  }
}
