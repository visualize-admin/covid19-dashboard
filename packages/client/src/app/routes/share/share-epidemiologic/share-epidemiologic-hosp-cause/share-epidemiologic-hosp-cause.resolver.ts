import { Injectable } from '@angular/core'
import { CantonGeoUnit, EpidemiologicSimpleGdi, HospReasonAgeRangeData, TopLevelGeoUnit } from '@c19/commons'
import { BaseShareEpidemiologicResolver } from '../base-share-epidemiologic.resolver'

@Injectable()
export class ShareEpidemiologicHospCauseResolver extends BaseShareEpidemiologicResolver<HospReasonAgeRangeData> {
  loadData(simpleGdi: EpidemiologicSimpleGdi, geoUnit: CantonGeoUnit | TopLevelGeoUnit) {
    return this.dataService.loadEpidemiologicHospReasonData(geoUnit)
  }
}
