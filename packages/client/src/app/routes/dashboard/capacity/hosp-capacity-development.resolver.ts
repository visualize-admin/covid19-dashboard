import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { CantonGeoUnit, GdiObject, HospCapacityDevelopmentData } from '@c19/commons'
import { DataService } from '../../../core/data/data.service'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RoutePaths } from '../../route-paths.enum'

@Injectable()
export class HospCapacityDevelopmentResolver implements Resolve<HospCapacityDevelopmentData> {
  constructor(private readonly dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<HospCapacityDevelopmentData> {
    const geoUnit: CantonGeoUnit | null = route.queryParams[QueryParams.GEO_FILTER]
    const gdiObject = route.url.find((s) => s.path === RoutePaths.DASHBOARD_CAPACITY_ICU)
      ? GdiObject.HOSP_CAPACITY_ICU
      : GdiObject.HOSP_CAPACITY_TOTAL
    return this.dataService.loadHospCapacityDevelopmentData(geoUnit, gdiObject)
  }
}
