import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { CantonGeoUnit, GdiObject } from '@c19/commons'
import { DataService } from '../../../../core/data/data.service'
import { QueryParams } from '../../../../shared/models/query-params.enum'

@Injectable()
export class DetailIntensiveResolver implements Resolve<any> {
  constructor(private readonly dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<any> {
    const geoUnit: CantonGeoUnit | null = route.queryParams[QueryParams.GEO_FILTER]
    return Promise.all([
      this.dataService.loadHospCapacityDevelopmentData(geoUnit, GdiObject.HOSP_CAPACITY_ICU),
      this.dataService.loadHospCapacityCertAdhocDevelopmentData(geoUnit),
    ])
  }
}
