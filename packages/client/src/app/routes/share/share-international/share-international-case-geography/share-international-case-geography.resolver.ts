import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { InternationalComparisonDetailGeoData } from '@c19/commons'
import { DataService } from '../../../../core/data/data.service'

@Injectable()
export class ShareInternationalCaseGeographyResolver implements Resolve<InternationalComparisonDetailGeoData> {
  constructor(private readonly dataService: DataService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<InternationalComparisonDetailGeoData> {
    return this.dataService.loadInternationalGeographyData()
  }
}
