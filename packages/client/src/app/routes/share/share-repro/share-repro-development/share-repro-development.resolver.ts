import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { DEFAULT_GEO_UNIT, ReDevelopment } from '@c19/commons'
import { DataService } from '../../../../core/data/data.service'
import { QueryParams } from '../../../../shared/models/query-params.enum'

@Injectable()
export class ShareReproDevelopmentResolver implements Resolve<ReDevelopment | null> {
  constructor(private readonly dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const geoUnit = route.queryParams[QueryParams.GEO_FILTER] || DEFAULT_GEO_UNIT
    return this.dataService.loadReproductionDevelopmentData(geoUnit)
  }
}
