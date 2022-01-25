import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { CantonGeoUnit, CovidVirusVariantsWgsDevelopmentData, DEFAULT_GEO_UNIT, TopLevelGeoUnit } from '@c19/commons'
import { DataService } from '../../../../core/data/data.service'
import { QueryParams } from '../../../../shared/models/query-params.enum'

@Injectable()
export class ShareVirusVariantsSegmentationResolver implements Resolve<CovidVirusVariantsWgsDevelopmentData> {
  constructor(private readonly dataService: DataService) {}

  resolve({ queryParams }: ActivatedRouteSnapshot) {
    const geoUnit: CantonGeoUnit | TopLevelGeoUnit = queryParams[QueryParams.GEO_FILTER] || DEFAULT_GEO_UNIT
    return this.dataService.loadVirusVariantsDevelopmentWgsData(geoUnit)
  }
}
