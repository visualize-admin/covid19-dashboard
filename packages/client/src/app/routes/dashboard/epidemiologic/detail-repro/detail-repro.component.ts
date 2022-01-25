import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { DEFAULT_GEO_UNIT, ReDevelopment } from '@c19/commons'
import { from, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { DataService } from '../../../../core/data/data.service'
import { ExtendedGeoFeatureCollection } from '../../../../diagrams/choropleth/base-choropleth.component'
import { QueryParams } from '../../../../shared/models/query-params.enum'
import { selectChanged } from '../../../../static-utils/select-changed.operator'
import { RouteDataKey } from '../../../route-data-key.enum'

@Component({
  selector: 'bag-detail-repro',
  templateUrl: './detail-repro.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailReproComponent {
  // tslint:disable-next-line:no-non-null-assertion
  readonly chflGeoJson: ExtendedGeoFeatureCollection = this.route.parent!.snapshot.data[RouteDataKey.GEO_JSON]

  readonly geographyData$ = from(this.dataService.loadReproductionGeographyData())

  readonly developmentData$: Observable<{ data: ReDevelopment | null }> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER, DEFAULT_GEO_UNIT),
    switchMap((geoUnit) => this.dataService.loadReproductionDevelopmentData(geoUnit)),
    map((data) => ({ data })),
  )

  constructor(protected route: ActivatedRoute, protected dataService: DataService) {}
}
