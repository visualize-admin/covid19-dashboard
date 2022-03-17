import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import {
  CantonGeoUnit,
  DEFAULT_GEO_UNIT,
  EpidemiologicDemographyData,
  EpidemiologicDevelopmentData,
  EpidemiologicGeographyData,
  EpidemiologicSimpleGdi,
  HospReasonAgeRangeData,
  TopLevelGeoUnit,
} from '@c19/commons'
import { Observable } from 'rxjs'
import { shareReplay, switchMap } from 'rxjs/operators'
import { CombinedEpidemiologicData, DataService } from '../../../core/data/data.service'
import { ExtendedGeoFeatureCollection } from '../../../diagrams/choropleth/base-choropleth.component'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { RouteDataKey } from '../../route-data-key.enum'

@Component({ template: '' })
export abstract class EpidemiologicBaseDetailComponent<
  GEO = EpidemiologicGeographyData,
  DEV = EpidemiologicDevelopmentData,
  DEM = EpidemiologicDemographyData,
  RSM = HospReasonAgeRangeData,
> {
  abstract readonly simpleGdi: EpidemiologicSimpleGdi

  // tslint:disable-next-line:no-non-null-assertion
  readonly chflGeoJson: ExtendedGeoFeatureCollection = this.route.parent!.snapshot.data[RouteDataKey.GEO_JSON]

  readonly geoFilter$: Observable<CantonGeoUnit | TopLevelGeoUnit> = this.route.queryParams.pipe(
    selectChanged(QueryParams.GEO_FILTER, DEFAULT_GEO_UNIT),
  )

  readonly data$: Observable<CombinedEpidemiologicData<GEO, DEV, DEM, RSM>>

  constructor(protected readonly route: ActivatedRoute, dataService: DataService) {
    this.data$ = this.geoFilter$.pipe(
      switchMap((geoFilter) => <Promise<any>>dataService.loadCombinedEpidemiologicData(this.simpleGdi, geoFilter)),
      shareReplay(1),
    )
  }
}
