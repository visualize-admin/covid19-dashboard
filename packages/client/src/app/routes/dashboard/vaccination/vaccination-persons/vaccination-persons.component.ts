import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
  EpidemiologicVaccDemographyDataV2,
  EpidemiologicVaccDosesLocationDevelopmentData,
  EpidemiologicVaccPersonsDevelopmentData,
  EpidemiologicVaccPersonsGeoData,
  EpidemiologicVaccPersonsIndicationDevelopmentData,
  EpidemiologicVaccPersonsVaccineDevelopmentData,
  VaccinationSimpleGdi,
} from '@c19/commons'
import { VaccinationBaseDetailComponent } from '../vaccination-base-detail.component'

@Component({
  selector: 'bag-vaccination-persons',
  templateUrl: './vaccination-persons.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaccinationPersonsComponent extends VaccinationBaseDetailComponent<
  EpidemiologicVaccPersonsGeoData,
  EpidemiologicVaccPersonsDevelopmentData,
  EpidemiologicVaccDemographyDataV2,
  EpidemiologicVaccDosesLocationDevelopmentData,
  EpidemiologicVaccPersonsIndicationDevelopmentData,
  EpidemiologicVaccPersonsVaccineDevelopmentData
> {
  readonly simpleGdi = VaccinationSimpleGdi.VACC_PERSONS
}
