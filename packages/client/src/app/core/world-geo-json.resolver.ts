import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { ExtendedGeoFeatureCollection } from '../diagrams/choropleth/base-choropleth.component'

@Injectable({ providedIn: 'root' })
export class WorldGeoJsonResolver implements Resolve<ExtendedGeoFeatureCollection> {
  private fileRequest: Promise<ExtendedGeoFeatureCollection> | null

  constructor(private readonly httpClient: HttpClient) {}

  resolve({ queryParams }: ActivatedRouteSnapshot): Promise<ExtendedGeoFeatureCollection> {
    if (!this.fileRequest) {
      this.fileRequest = firstValueFrom(
        this.httpClient.get<ExtendedGeoFeatureCollection>(`/assets/geojson/world_OSM_NUTS_v1.feature.json`),
      )
    }
    return this.fileRequest
  }
}
