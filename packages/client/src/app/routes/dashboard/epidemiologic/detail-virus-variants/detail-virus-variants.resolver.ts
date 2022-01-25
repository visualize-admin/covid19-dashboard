import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { DEFAULT_GEO_UNIT } from '@c19/commons'
import { CombinedVirusVariantsData, DataService } from '../../../../core/data/data.service'
import { QueryParams } from '../../../../shared/models/query-params.enum'

@Injectable({ providedIn: 'root' })
export class DetailVirusVariantsResolver implements Resolve<CombinedVirusVariantsData> {
  constructor(private readonly dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<CombinedVirusVariantsData> {
    const geo = route.queryParams[QueryParams.GEO_FILTER] || DEFAULT_GEO_UNIT
    return this.dataService.loadCombinedVirusVariantsData(geo)
  }
}
