import { Injectable } from '@angular/core'
import {
  CantonGeoUnit,
  EpidemiologicVaccDosesDevelopmentData,
  EpidemiologicVaccPersonsDevelopmentData,
  EpidemiologicVaccSymptomsDevelopmentData,
  TopLevelGeoUnit,
  VaccinationSimpleGdi,
  VaccinationStatusDevelopmentData,
} from '@c19/commons'
import { BaseShareVaccinationResolver } from '../base-share-vaccination.resolver'

type VaccDevData =
  | EpidemiologicVaccSymptomsDevelopmentData
  | EpidemiologicVaccPersonsDevelopmentData
  | EpidemiologicVaccDosesDevelopmentData
  | VaccinationStatusDevelopmentData

@Injectable()
export class ShareVaccinationDevelopmentResolver extends BaseShareVaccinationResolver<VaccDevData> {
  loadData(simpleGdi: VaccinationSimpleGdi, geoUnit: CantonGeoUnit | TopLevelGeoUnit): Promise<VaccDevData> {
    return this.dataService.loadVaccinationDevelopmentData(simpleGdi, geoUnit)
  }
}
