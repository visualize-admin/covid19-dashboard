import { Injectable } from '@angular/core'
import {
  CantonGeoUnit,
  EpidemiologicVaccDosesLocationDevelopmentData,
  TopLevelGeoUnit,
  VaccinationSimpleGdi,
} from '@c19/commons'
import { BaseShareVaccinationResolver } from '../base-share-vaccination.resolver'

@Injectable()
export class ShareVaccinationLocationResolver extends BaseShareVaccinationResolver<EpidemiologicVaccDosesLocationDevelopmentData> {
  loadData(simpleGdi: VaccinationSimpleGdi, geoUnit: CantonGeoUnit | TopLevelGeoUnit) {
    return this.dataService.loadVaccinationDosesDevelopmentLocationData(geoUnit)
  }
}
