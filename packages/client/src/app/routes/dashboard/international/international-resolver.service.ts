import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { DataService } from '../../../core/data/data.service'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { InternationalCombinedData } from './international-combined-data.type'

@Injectable({ providedIn: 'root' })
export class InternationalResolver implements Resolve<InternationalCombinedData> {
  constructor(private readonly dataService: DataService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<InternationalCombinedData> {
    const [quarantine, geography, development] = await Promise.all([
      this.dataService.loadInternationalQuarantineData(),
      this.dataService.loadInternationalGeographyData(),
      this.dataService.loadInternationalDevelopmentData(route.queryParams[QueryParams.GEO_FILTER] || null),
    ])
    return { quarantine, geography, development }
  }
}
