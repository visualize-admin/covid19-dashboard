import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { GdiObject } from '@c19/commons'
import { DataService } from '../../../core/data/data.service'

@Injectable()
export class HospCapacityGeographyResolver implements Resolve<any> {
  constructor(private readonly dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<any> {
    return Promise.all([
      this.dataService.loadHospCapacityGeographyData(GdiObject.HOSP_CAPACITY_ICU),
      this.dataService.loadHospCapacityGeographyData(GdiObject.HOSP_CAPACITY_TOTAL),
    ])
  }
}
