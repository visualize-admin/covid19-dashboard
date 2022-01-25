import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { CantonGeoUnit, GdiObject, HospCapacityDevelopmentData, HospCapacityGeographyData } from '@c19/commons'
import { Observable, of } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'
import { DataService } from '../../../core/data/data.service'
import { ExtendedGeoFeatureCollection } from '../../../diagrams/choropleth/base-choropleth.component'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { RouteDataKey } from '../../route-data-key.enum'

@Component({ template: '' })
export abstract class CapacityBaseDetailComponent {
  abstract readonly gdiObject: GdiObject.HOSP_CAPACITY_ICU | GdiObject.HOSP_CAPACITY_TOTAL

  // tslint:disable-next-line:no-non-null-assertion
  readonly chflGeoJson: ExtendedGeoFeatureCollection = this.route.parent!.snapshot.data[RouteDataKey.GEO_JSON]

  readonly geographyData$: Observable<HospCapacityGeographyData> = of(void 0).pipe(
    switchMap(() => this.dataService.loadHospCapacityGeographyData(this.gdiObject)),
    shareReplay(1),
  )
  readonly developmentData$: Observable<HospCapacityDevelopmentData> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER),
    switchMap((geo: CantonGeoUnit | null) => this.dataService.loadHospCapacityDevelopmentData(geo, this.gdiObject)),
    shareReplay(1),
  )

  constructor(protected route: ActivatedRoute, protected dataService: DataService) {}
}
