import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { CantonGeoUnit, DEFAULT_GEO_UNIT, EpidemiologicSimpleGdi, TopLevelGeoUnit } from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { DataService } from '../../../core/data/data.service'
import { PathParams } from '../../../shared/models/path-params.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'

export type ActualEpiSimpleGdi =
  | EpidemiologicSimpleGdi.CASE
  | EpidemiologicSimpleGdi.HOSP
  | EpidemiologicSimpleGdi.DEATH
  | EpidemiologicSimpleGdi.TEST

@Injectable()
export abstract class BaseShareEpidemiologicResolver<T> implements Resolve<T> {
  constructor(protected readonly dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<T> {
    const geoUnit: CantonGeoUnit | TopLevelGeoUnit = route.queryParams[QueryParams.GEO_FILTER] || DEFAULT_GEO_UNIT
    return this.loadData(this.getGdi(route), geoUnit)
  }

  abstract loadData(simpleGdi: ActualEpiSimpleGdi, geoUnit: CantonGeoUnit | TopLevelGeoUnit): Promise<T>

  protected getGdi({ parent }: ActivatedRouteSnapshot): ActualEpiSimpleGdi {
    const dataObjectKeyParam: string = parent?.params[PathParams.DETAIL_DATA_OBJECT_KEY]

    return getEnumValues(EpidemiologicSimpleGdi).includes(dataObjectKeyParam)
      ? <ActualEpiSimpleGdi>dataObjectKeyParam
      : EpidemiologicSimpleGdi.CASE
  }
}
