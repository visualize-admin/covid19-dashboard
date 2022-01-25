import { Injectable } from '@angular/core'
import {
  CantonGeoUnit,
  EpidemiologicVaccDemographyDataV2,
  EpidemiologicVaccSymptomsDemographyData,
  TopLevelGeoUnit,
  VaccinationSimpleGdi,
  VaccinationStatusDemographyData,
} from '@c19/commons'
import { BaseShareVaccinationResolver } from '../base-share-vaccination.resolver'

type VaccDemoData =
  | EpidemiologicVaccDemographyDataV2
  | EpidemiologicVaccSymptomsDemographyData
  | VaccinationStatusDemographyData

@Injectable()
export class ShareVaccinationDemographyResolver extends BaseShareVaccinationResolver<VaccDemoData> {
  loadData(simpleGdi: VaccinationSimpleGdi, geoUnit: CantonGeoUnit | TopLevelGeoUnit): Promise<VaccDemoData> {
    return this.dataService.loadVaccinationDemographyData(simpleGdi, geoUnit)
  }
}
