import { Injectable } from '@angular/core'
import { CantonGeoUnit, HospCapacityCertAdhocDevelopmentData, HospCapacityGdiObjects } from '@c19/commons'
import { BaseShareHospCapacityResolver } from '../base-share-hosp-capacity.resolver'

@Injectable()
export class ShareHospCapacityCertifiedBedsResolver extends BaseShareHospCapacityResolver<HospCapacityCertAdhocDevelopmentData> {
  protected loadData(
    gdiObject: HospCapacityGdiObjects,
    geoUnit: CantonGeoUnit | null,
  ): Promise<HospCapacityCertAdhocDevelopmentData> {
    return this.dataService.loadHospCapacityCertAdhocDevelopmentData(geoUnit)
  }
}
