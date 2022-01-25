import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { InternationalComparisonDetailData, InternationalComparisonDetailGeoData } from '@c19/commons'
import { Observable } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { DataService } from '../../../../core/data/data.service'
import { ExtendedGeoFeatureCollection } from '../../../../diagrams/choropleth/base-choropleth.component'
import { QueryParams } from '../../../../shared/models/query-params.enum'
import { selectChanged } from '../../../../static-utils/select-changed.operator'
import { RouteDataKey } from '../../../route-data-key.enum'
import { InternationalCombinedData } from '../international-combined-data.type'

@Component({
  selector: 'bag-detail-international-case',
  templateUrl: './detail-international-case.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailInternationalCaseComponent {
  // tslint:disable-next-line:no-non-null-assertion
  readonly worldGeoJson: ExtendedGeoFeatureCollection = this.route.parent!.snapshot.data[RouteDataKey.GEO_JSON]

  readonly geographyData: InternationalComparisonDetailGeoData
  readonly developmentData$: Observable<{ data: InternationalComparisonDetailData | null }>

  constructor(protected route: ActivatedRoute, dataService: DataService) {
    // tslint:disable-next-line:no-non-null-assertion
    const combinedData: InternationalCombinedData = this.route.parent!.snapshot.data[RouteDataKey.DETAIL_DATA]
    this.geographyData = combinedData.geography
    this.developmentData$ = this.route.queryParams.pipe(
      selectChanged(QueryParams.GEO_FILTER),
      switchMap((geoUnit) => dataService.loadInternationalDevelopmentData(geoUnit)),
      // wrapper object necessary, otherwise *ngIf="developmentData$|async" does not evaluate to true when null
      map((data) => ({ data })),
      shareReplay(1),
    )
  }
}
