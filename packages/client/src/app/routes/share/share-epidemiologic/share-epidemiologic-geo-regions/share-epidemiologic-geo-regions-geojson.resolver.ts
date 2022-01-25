import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { ExtendedGeoFeatureCollection } from '../../../../diagrams/choropleth/base-choropleth.component'
import { DEFAULT_GEO_LEVEL_FILTER, GeoLevelFilter } from '../../../../shared/models/filters/geo-level-filter.enum'
import { MatrixParams } from '../../../../shared/models/matrix-params.enum'

const GEO_JSON_PATH = '/assets/geojson'

@Injectable()
export class ShareEpidemiologicGeoRegionsGeojsonResolver implements Resolve<ExtendedGeoFeatureCollection> {
  constructor(private readonly http: HttpClient) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<ExtendedGeoFeatureCollection> {
    const geoLevel: GeoLevelFilter = route.params[MatrixParams.GEO_LEVEL] || DEFAULT_GEO_LEVEL_FILTER
    const geoJsonFile = `${geoLevel.toLocaleLowerCase()}_v0.feature.json`
    return firstValueFrom(this.http.get<ExtendedGeoFeatureCollection>(`${GEO_JSON_PATH}/${geoJsonFile}`))
  }
}
