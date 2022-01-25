import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { DEFAULT_GEO_UNIT, VaccinationSimpleGdi } from '@c19/commons'
import { CombinedVaccinationData, DataService } from '../../../core/data/data.service'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'

@Injectable({ providedIn: 'root' })
export class VaccinationChildResolver implements Resolve<CombinedVaccinationData> {
  constructor(private readonly dataService: DataService) {}

  async resolve(
    { queryParams, data }: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<CombinedVaccinationData> {
    const geo = queryParams[QueryParams.GEO_FILTER] || DEFAULT_GEO_UNIT
    const simpleGdi: VaccinationSimpleGdi = data[RouteDataKey.SIMPLE_GDI_OBJECT]
    return this.dataService.loadCombinedVaccinationData(simpleGdi, geo)
  }
}
