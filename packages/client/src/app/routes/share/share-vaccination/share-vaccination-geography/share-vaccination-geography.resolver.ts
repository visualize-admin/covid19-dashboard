import { Injectable } from '@angular/core'
import {
  EpidemiologicVaccDosesGeographyData,
  EpidemiologicVaccPersonsGeoData,
  VaccinationSimpleGdi,
} from '@c19/commons'
import { BaseShareVaccinationResolver } from '../base-share-vaccination.resolver'

type DosesOrPersons = VaccinationSimpleGdi.VACC_DOSES | VaccinationSimpleGdi.VACC_PERSONS
type VaccGeoData = EpidemiologicVaccDosesGeographyData | EpidemiologicVaccPersonsGeoData

@Injectable()
export class ShareVaccinationGeographyResolver extends BaseShareVaccinationResolver<VaccGeoData> {
  loadData(simpleGdi: VaccinationSimpleGdi) {
    const gdi = [VaccinationSimpleGdi.VACC_DOSES, VaccinationSimpleGdi.VACC_PERSONS].includes(simpleGdi)
      ? <DosesOrPersons>simpleGdi
      : VaccinationSimpleGdi.VACC_DOSES
    return this.dataService.loadVaccinationGeographyData(gdi)
  }
}
