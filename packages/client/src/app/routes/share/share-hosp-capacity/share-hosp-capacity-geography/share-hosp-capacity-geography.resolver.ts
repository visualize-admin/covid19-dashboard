import { Injectable } from '@angular/core'
import { HospCapacityGdiObjects, HospCapacityGeographyData } from '@c19/commons'
import { BaseShareHospCapacityResolver } from '../base-share-hosp-capacity.resolver'

@Injectable()
export class ShareHospCapacityGeographyResolver extends BaseShareHospCapacityResolver<HospCapacityGeographyData> {
  protected loadData(gdiObject: HospCapacityGdiObjects): Promise<HospCapacityGeographyData> {
    return this.dataService.loadHospCapacityGeographyData(gdiObject)
  }
}
