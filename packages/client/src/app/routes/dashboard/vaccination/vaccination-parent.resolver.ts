import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { DEFAULT_GEO_UNIT, VaccinationSimpleGdi } from '@c19/commons'
import { DataService, VaccinationMenuData } from '../../../core/data/data.service'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'

@Injectable({ providedIn: 'root' })
export class VaccinationParentResolver implements Resolve<VaccinationMenuData> {
  constructor(private readonly dataService: DataService) {}

  async resolve(
    { queryParams, children }: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<VaccinationMenuData> {
    const geoUnit = queryParams[QueryParams.GEO_FILTER] || DEFAULT_GEO_UNIT

    const simpleGdi: VaccinationSimpleGdi = children[0].data[RouteDataKey.SIMPLE_GDI_OBJECT]

    const dataPromises = [this.dataService.loadVaccinationMenuData(geoUnit)]
    // already load the vaccination data (basically only used in child route,
    // but we can reduce the loading time when we load it parallel)
    dataPromises.push(<any>this.dataService.loadCombinedVaccinationData(simpleGdi, geoUnit))

    const [allDev] = await Promise.all(dataPromises)
    return allDev
  }
}
