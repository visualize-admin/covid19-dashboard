import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { firstValueFrom } from 'rxjs'

export interface SgChoroplethData {
  amgr: any
  amre: any
  district: any
  municipality: any
  greaterRegion: any
  canton: any
}

const TEMP_DATA_PATH = '/assets/temp-data'

@Injectable()
export class SgChoroplethDataResolver implements Resolve<SgChoroplethData> {
  constructor(private readonly http: HttpClient) {}

  async resolve(): Promise<SgChoroplethData> {
    const [amgr, amre, district, municipality, greaterRegion, canton] = await Promise.all([
      this.get(`${TEMP_DATA_PATH}/cases-greater-labor-market.json`),
      this.get(`${TEMP_DATA_PATH}/cases-labor-market.json`),
      this.get(`${TEMP_DATA_PATH}/cases-district.json`),
      this.get(`${TEMP_DATA_PATH}/cases-municipality.json`),
      this.get(`${TEMP_DATA_PATH}/cases-greater-region.json`),
      this.get(`${TEMP_DATA_PATH}/cases-canton.json`),
    ])

    return { amgr, amre, district, municipality, greaterRegion, canton }
  }

  private get(path: string): Promise<any> {
    return firstValueFrom(this.http.get(path))
  }
}
