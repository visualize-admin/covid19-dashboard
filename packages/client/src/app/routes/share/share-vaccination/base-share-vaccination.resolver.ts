import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { CantonGeoUnit, DEFAULT_GEO_UNIT, TopLevelGeoUnit, VaccinationSimpleGdi } from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { DataService } from '../../../core/data/data.service'
import { PathParams } from '../../../shared/models/path-params.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'

@Injectable()
export abstract class BaseShareVaccinationResolver<T> implements Resolve<T> {
  constructor(protected readonly dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<T> {
    const geoUnit: CantonGeoUnit | TopLevelGeoUnit = route.queryParams[QueryParams.GEO_FILTER] || DEFAULT_GEO_UNIT
    return this.loadData(this.getGdi(route), geoUnit)
  }

  abstract loadData(simpleGdi: VaccinationSimpleGdi, geoUnit: CantonGeoUnit | TopLevelGeoUnit): Promise<T>

  protected getGdi({ parent }: ActivatedRouteSnapshot): VaccinationSimpleGdi {
    const dataObjectKeyParam = `vacc-${parent?.params[PathParams.DETAIL_DATA_OBJECT_KEY]}`

    return getEnumValues(VaccinationSimpleGdi).includes(dataObjectKeyParam)
      ? <VaccinationSimpleGdi>dataObjectKeyParam
      : VaccinationSimpleGdi.VACC_DOSES
  }
}
