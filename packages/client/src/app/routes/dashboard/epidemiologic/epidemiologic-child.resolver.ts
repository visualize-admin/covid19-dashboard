import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { DEFAULT_GEO_UNIT, EpidemiologicSimpleGdi } from '@c19/commons'
import { CombinedEpidemiologicData, DataService } from '../../../core/data/data.service'
import { QueryParams } from '../../../shared/models/query-params.enum'

@Injectable({ providedIn: 'root' })
export class EpidemiologicChildResolver implements Resolve<CombinedEpidemiologicData> {
  constructor(private readonly dataService: DataService) {}

  async resolve(
    { queryParams }: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<CombinedEpidemiologicData> {
    const geo = queryParams[QueryParams.GEO_FILTER] || DEFAULT_GEO_UNIT
    const simpleGdi: EpidemiologicSimpleGdi = <any>state.url.split('/').reverse()[0].split(/[?#]/)[0]
    return this.dataService.loadCombinedEpidemiologicData(simpleGdi, geo)
  }
}
