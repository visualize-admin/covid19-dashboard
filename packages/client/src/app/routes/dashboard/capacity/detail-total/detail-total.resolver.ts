import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { CantonGeoUnit, GdiObject, HospCapacityDevelopmentData } from '@c19/commons'
import { DataService } from '../../../../core/data/data.service'
import { QueryParams } from '../../../../shared/models/query-params.enum'

@Injectable()
export class DetailTotalResolver implements Resolve<HospCapacityDevelopmentData> {
  constructor(private readonly dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<HospCapacityDevelopmentData> {
    const geoUnit: CantonGeoUnit | null = route.queryParams[QueryParams.GEO_FILTER]
    return this.dataService.loadHospCapacityDevelopmentData(geoUnit, GdiObject.HOSP_CAPACITY_TOTAL)
  }
}
