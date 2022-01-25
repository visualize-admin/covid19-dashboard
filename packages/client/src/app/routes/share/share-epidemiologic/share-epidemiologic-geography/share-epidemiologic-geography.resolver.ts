import { Injectable } from '@angular/core'
import {
  CantonGeoUnit,
  CovidVirusVariantsGeographyDataV2,
  EpidemiologicGeographyData,
  EpidemiologicSimpleGdi,
  EpidemiologicTestGeographyData,
  TopLevelGeoUnit,
} from '@c19/commons'
import { BaseShareEpidemiologicResolver } from '../base-share-epidemiologic.resolver'

@Injectable()
export class ShareEpidemiologicGeographyResolver extends BaseShareEpidemiologicResolver<
  EpidemiologicGeographyData | EpidemiologicTestGeographyData | CovidVirusVariantsGeographyDataV2
> {
  loadData(simpleGdi: EpidemiologicSimpleGdi, geoUnit: CantonGeoUnit | TopLevelGeoUnit) {
    return this.dataService.loadEpidemiologicGeographyData(simpleGdi)
  }
}
