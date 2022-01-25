import { Injectable } from '@angular/core'
import {
  CantonGeoUnit,
  EpidemiologicDevelopmentData,
  EpidemiologicSimpleGdi,
  EpidemiologicTestDevelopmentData,
  TopLevelGeoUnit,
} from '@c19/commons'
import { BaseShareEpidemiologicResolver } from '../base-share-epidemiologic.resolver'

@Injectable()
export class ShareEpidemiologicDevelopmentResolver extends BaseShareEpidemiologicResolver<
  EpidemiologicDevelopmentData | EpidemiologicTestDevelopmentData
> {
  loadData(simpleGdi: EpidemiologicSimpleGdi, geoUnit: CantonGeoUnit | TopLevelGeoUnit) {
    return this.dataService.loadEpidemiologicDevelopmentData(simpleGdi, geoUnit)
  }
}
