import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { firstValueFrom } from 'rxjs'

export interface SgChoroplethGeoJson {
  amgr: any
  amre: any
  district: any
  municipality: any
  greaterRegion: any
  canton: any
  world: any
}

const GEO_JSON_PATH = '/assets/geojson'

@Injectable()
export class SgChoroplethGeoJsonResolver implements Resolve<SgChoroplethGeoJson> {
  constructor(private readonly http: HttpClient) {}

  async resolve(): Promise<SgChoroplethGeoJson> {
    const [amgr, amre, district, municipality, greaterRegion, canton, world] = await Promise.all([
      this.get(`${GEO_JSON_PATH}/amgr_v0.feature.json`),
      this.get(`${GEO_JSON_PATH}/amre_v0.feature.json`),
      this.get(`${GEO_JSON_PATH}/districts_v0.feature.json`),
      this.get(`${GEO_JSON_PATH}/municipalities_v0.feature.json`),
      this.get(`${GEO_JSON_PATH}/greaterregions_v0.feature.json`),
      this.get(`${GEO_JSON_PATH}/cantons_v0.feature.json`),
      this.get(`${GEO_JSON_PATH}/world_OSM_NUTS_v1.feature.json`),
    ])

    return { amgr, amre, district, municipality, greaterRegion, canton, world }
  }

  private get(path: string): Promise<any> {
    return firstValueFrom(this.http.get(path))
  }
}
