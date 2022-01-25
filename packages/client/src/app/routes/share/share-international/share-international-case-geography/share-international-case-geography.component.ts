import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { InternationalComparisonDetailGeoData } from '@c19/commons'
import { ExtendedGeoFeatureCollection } from '../../../../diagrams/choropleth/base-choropleth.component'
import { QueryParams } from '../../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../../route-data-key.enum'

@Component({
  selector: 'bag-share-international-case-geography',
  templateUrl: './share-international-case-geography.component.html',
  styleUrls: ['./share-international-case-geography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareInternationalCaseGeographyComponent {
  readonly worldGeoJson: ExtendedGeoFeatureCollection = this.route.snapshot.data[RouteDataKey.GEO_JSON]
  readonly data: InternationalComparisonDetailGeoData = this.route.snapshot.data[RouteDataKey.DETAIL_DATA]
  readonly isExport = this.route.snapshot.queryParams[QueryParams.IS_EXPORT] === 'true'

  constructor(protected readonly route: ActivatedRoute) {}
}
