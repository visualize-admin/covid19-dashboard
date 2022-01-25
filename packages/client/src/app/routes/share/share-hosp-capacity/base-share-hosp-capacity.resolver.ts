import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { CantonGeoUnit, GdiObject, HospCapacityGdiObjects } from '@c19/commons'
import { DataService } from '../../../core/data/data.service'
import { PathParams } from '../../../shared/models/path-params.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { SimpleGdiObjectKey } from '../../../shared/models/simple-gdi-object-key.enum'

@Injectable()
export abstract class BaseShareHospCapacityResolver<T> implements Resolve<T> {
  constructor(protected readonly dataService: DataService) {}

  protected abstract loadData(gdiObject: HospCapacityGdiObjects, geoUnit: CantonGeoUnit | null): Promise<T>

  resolve({ queryParams, parent }: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<T> {
    const geoUnit: CantonGeoUnit | null = queryParams[QueryParams.GEO_FILTER] || null
    const dataObjectKeyParam: SimpleGdiObjectKey = parent?.params[PathParams.DETAIL_DATA_OBJECT_KEY]
    const gdiObject: HospCapacityGdiObjects =
      dataObjectKeyParam === SimpleGdiObjectKey.TOTAL ? GdiObject.HOSP_CAPACITY_TOTAL : GdiObject.HOSP_CAPACITY_ICU
    return this.loadData(gdiObject, geoUnit)
  }
}
