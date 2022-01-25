import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { DEFAULT_GEO_UNIT } from '@c19/commons'
import { CombinedReproductionData, DataService } from '../../../../core/data/data.service'
import { QueryParams } from '../../../../shared/models/query-params.enum'

@Injectable({ providedIn: 'root' })
export class DetailReproResolver implements Resolve<any> {
  constructor(private readonly dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<CombinedReproductionData> {
    const geoUnit = route.queryParams[QueryParams.GEO_FILTER] || DEFAULT_GEO_UNIT
    return this.dataService.loadCombinedReproductionData(geoUnit)
  }
}
