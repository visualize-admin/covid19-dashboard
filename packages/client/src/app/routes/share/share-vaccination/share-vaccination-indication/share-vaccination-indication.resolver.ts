import { Injectable } from '@angular/core'
import {
  CantonGeoUnit,
  EpidemiologicVaccIndicationDevelopmentData,
  TopLevelGeoUnit,
  VaccinationSimpleGdi,
} from '@c19/commons'
import { BaseShareVaccinationResolver } from '../base-share-vaccination.resolver'

type DosesOrPersons = VaccinationSimpleGdi.VACC_DOSES | VaccinationSimpleGdi.VACC_PERSONS

@Injectable()
export class ShareVaccinationIndicationResolver extends BaseShareVaccinationResolver<EpidemiologicVaccIndicationDevelopmentData> {
  loadData(simpleGdi: VaccinationSimpleGdi, geoUnit: CantonGeoUnit | TopLevelGeoUnit) {
    const gdi = [VaccinationSimpleGdi.VACC_DOSES, VaccinationSimpleGdi.VACC_PERSONS].includes(simpleGdi)
      ? <DosesOrPersons>simpleGdi
      : VaccinationSimpleGdi.VACC_DOSES
    return this.dataService.loadVaccinationDevelopmentIndicationData(gdi, geoUnit)
  }
}
