import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { InternationalComparisonDetailData } from '@c19/commons'
import { DataService } from '../../../../core/data/data.service'
import { QueryParams } from '../../../../shared/models/query-params.enum'

@Injectable()
export class ShareInternationalCaseDevelopmentResolver implements Resolve<InternationalComparisonDetailData | null> {
  constructor(private readonly dataService: DataService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<InternationalComparisonDetailData | null> {
    return this.dataService.loadInternationalDevelopmentData(route.queryParams[QueryParams.GEO_FILTER] || null)
  }
}
