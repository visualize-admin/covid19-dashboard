import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { DEFAULT_GEO_UNIT, EpidemiologicSimpleGdi } from '@c19/commons'
import { DataService, EpidemiologicMenuData } from '../../../core/data/data.service'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { RouteDataKey } from '../../route-data-key.enum'

@Injectable({ providedIn: 'root' })
export class EpidemiologicParentResolver implements Resolve<EpidemiologicMenuData> {
  constructor(private readonly dataService: DataService) {}

  async resolve(
    { queryParams, children }: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<EpidemiologicMenuData> {
    const geoUnit = queryParams[QueryParams.GEO_FILTER] || DEFAULT_GEO_UNIT

    const simpleGdi: EpidemiologicSimpleGdi = children[0].data[RouteDataKey.SIMPLE_GDI_OBJECT]

    const dataPromises = [this.dataService.loadEpidemiologicMenuData(geoUnit)]
    // already load the epidemiologic data (basically only used in child route,
    // but we can reduce the loading time when we load it parallel)
    if (simpleGdi === EpidemiologicSimpleGdi.VIRUS_VARIANTS) {
      dataPromises.push(<any>this.dataService.loadCombinedVirusVariantsData(geoUnit))
    } else if (simpleGdi === EpidemiologicSimpleGdi.REPRO) {
      dataPromises.push(<any>this.dataService.loadCombinedReproductionData(geoUnit))
    } else {
      dataPromises.push(<any>this.dataService.loadCombinedEpidemiologicData(simpleGdi, geoUnit))
    }
    const [allDev] = await Promise.all(dataPromises)
    return allDev
  }
}
