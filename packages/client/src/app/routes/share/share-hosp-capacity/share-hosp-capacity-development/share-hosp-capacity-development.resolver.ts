import { Injectable } from '@angular/core'
import { CantonGeoUnit, HospCapacityDevelopmentData, HospCapacityGdiObjects } from '@c19/commons'
import { BaseShareHospCapacityResolver } from '../base-share-hosp-capacity.resolver'

@Injectable()
export class ShareHospCapacityDevelopmentResolver extends BaseShareHospCapacityResolver<HospCapacityDevelopmentData> {
  protected loadData(
    gdiObject: HospCapacityGdiObjects,
    geoUnit: CantonGeoUnit | null,
  ): Promise<HospCapacityDevelopmentData> {
    return this.dataService.loadHospCapacityDevelopmentData(geoUnit, gdiObject)
  }
}
