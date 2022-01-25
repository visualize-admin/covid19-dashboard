import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { InternationalQuarantineData } from '@c19/commons'
import { ExtendedGeoFeatureCollection } from '../../../../diagrams/choropleth/base-choropleth.component'
import { QueryParams } from '../../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../../route-data-key.enum'

@Component({
  selector: 'bag-share-international-quarantine-geography',
  templateUrl: './share-international-quarantine-geography.component.html',
  styleUrls: ['./share-international-quarantine-geography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareInternationalQuarantineGeographyComponent {
  readonly worldGeoJson: ExtendedGeoFeatureCollection = this.route.snapshot.data[RouteDataKey.GEO_JSON]
  readonly data: InternationalQuarantineData = this.route.snapshot.data[RouteDataKey.DETAIL_DATA]
  readonly isExport = this.route.snapshot.queryParams[QueryParams.IS_EXPORT] === 'true'
  constructor(protected readonly route: ActivatedRoute) {}
}
