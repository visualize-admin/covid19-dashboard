import { Injectable } from '@angular/core'
import { CantonGeoUnit, EpidemiologicDemographyData, EpidemiologicSimpleGdi, TopLevelGeoUnit } from '@c19/commons'
import { BaseShareEpidemiologicResolver } from '../base-share-epidemiologic.resolver'

@Injectable()
export class ShareEpidemiologicDemographyResolver extends BaseShareEpidemiologicResolver<EpidemiologicDemographyData> {
  loadData(simpleGdi: EpidemiologicSimpleGdi, geoUnit: CantonGeoUnit | TopLevelGeoUnit) {
    return this.dataService.loadEpidemiologicDemographyData(simpleGdi, geoUnit)
  }
}
