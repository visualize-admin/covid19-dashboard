import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { CantonGeoUnit, DEFAULT_GEO_UNIT, TopLevelGeoUnit } from '@c19/commons'
import { Observable } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'
import { CombinedVirusVariantsData, DataService } from '../../../../core/data/data.service'
import { ExtendedGeoFeatureCollection } from '../../../../diagrams/choropleth/base-choropleth.component'
import { QueryParams } from '../../../../shared/models/query-params.enum'
import { selectChanged } from '../../../../static-utils/select-changed.operator'
import { RouteDataKey } from '../../../route-data-key.enum'

@Component({
  selector: 'bag-detail-virus-variants',
  templateUrl: './detail-virus-variants.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailVirusVariantsComponent {
  // tslint:disable-next-line:no-non-null-assertion
  readonly chflGeoJson: ExtendedGeoFeatureCollection = this.route.parent!.snapshot.data[RouteDataKey.GEO_JSON]

  readonly geoFilter$: Observable<CantonGeoUnit | TopLevelGeoUnit> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER, DEFAULT_GEO_UNIT),
  )

  readonly data$: Observable<CombinedVirusVariantsData>

  constructor(protected readonly route: ActivatedRoute, dataService: DataService) {
    this.data$ = this.geoFilter$.pipe(
      switchMap((geoFilter) => dataService.loadCombinedVirusVariantsData(geoFilter)),
      shareReplay(1),
    )
  }
}
