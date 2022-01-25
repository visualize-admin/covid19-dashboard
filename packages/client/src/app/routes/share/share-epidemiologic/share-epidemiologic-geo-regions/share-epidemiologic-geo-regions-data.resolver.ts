import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { ExtraGeoUnitsData } from '@c19/commons'
import { DataService } from '../../../../core/data/data.service'
import { DEFAULT_GEO_LEVEL_FILTER, GeoLevelFilter } from '../../../../shared/models/filters/geo-level-filter.enum'
import { MatrixParams } from '../../../../shared/models/matrix-params.enum'

@Injectable()
export class ShareEpidemiologicGeoRegionsDataResolver implements Resolve<ExtraGeoUnitsData> {
  constructor(private readonly dataService: DataService) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<ExtraGeoUnitsData> {
    const geoLevel: GeoLevelFilter = route.params[MatrixParams.GEO_LEVEL] || DEFAULT_GEO_LEVEL_FILTER
    return this.dataService.loadExtraGeoUnitsData(geoLevel)
  }
}
