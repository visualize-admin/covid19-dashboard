import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { ExtendedGeoFeatureCollection } from '../diagrams/choropleth/base-choropleth.component'

@Injectable({ providedIn: 'root' })
export class ChflGeoJsonResolver implements Resolve<ExtendedGeoFeatureCollection> {
  private fileRequest: Promise<ExtendedGeoFeatureCollection> | null

  constructor(private readonly httpClient: HttpClient) {}

  resolve(): Promise<ExtendedGeoFeatureCollection> {
    if (!this.fileRequest) {
      this.fileRequest = firstValueFrom(
        this.httpClient.get<ExtendedGeoFeatureCollection>('/assets/geojson/chfl_v1.feature.json'),
      )
    }
    return this.fileRequest
  }
}
