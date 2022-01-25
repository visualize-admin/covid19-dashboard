import { Injectable } from '@angular/core'
import {
  CantonGeoUnit,
  EpidemiologicVaccVaccineDevelopmentData,
  TopLevelGeoUnit,
  VaccinationSimpleGdi,
  VaccinationStatusVaccineDevelopmentData,
} from '@c19/commons'
import { BaseShareVaccinationResolver } from '../base-share-vaccination.resolver'

type DosesOrPersons = VaccinationSimpleGdi.VACC_DOSES | VaccinationSimpleGdi.VACC_PERSONS

@Injectable()
export class ShareVaccinationVaccineResolver extends BaseShareVaccinationResolver<
  EpidemiologicVaccVaccineDevelopmentData | VaccinationStatusVaccineDevelopmentData
> {
  loadData(simpleGdi: VaccinationSimpleGdi, geoUnit: CantonGeoUnit | TopLevelGeoUnit) {
    const gdi = [
      VaccinationSimpleGdi.VACC_DOSES,
      VaccinationSimpleGdi.VACC_PERSONS,
      VaccinationSimpleGdi.VACC_STATUS,
    ].includes(simpleGdi)
      ? <DosesOrPersons>simpleGdi
      : VaccinationSimpleGdi.VACC_DOSES
    return this.dataService.loadVaccinationDevelopmentVaccineData(gdi, geoUnit)
  }
}
