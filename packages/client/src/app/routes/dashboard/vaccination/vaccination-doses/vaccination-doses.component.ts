import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
  EpidemiologicVaccDemographyData,
  EpidemiologicVaccDosesAdministeredIndicationDevelopmentData,
  EpidemiologicVaccDosesVaccineDevelopmentData,
  EpidemiologicVaccDosesDevelopmentData,
  EpidemiologicVaccDosesGeographyData,
  EpidemiologicVaccDosesLocationDevelopmentData,
  VaccinationSimpleGdi,
} from '@c19/commons'
import { VaccinationBaseDetailComponent } from '../vaccination-base-detail.component'

@Component({
  selector: 'bag-vaccination-doses',
  templateUrl: './vaccination-doses.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaccinationDosesComponent extends VaccinationBaseDetailComponent<
  EpidemiologicVaccDosesGeographyData,
  EpidemiologicVaccDosesDevelopmentData,
  EpidemiologicVaccDemographyData,
  EpidemiologicVaccDosesLocationDevelopmentData,
  EpidemiologicVaccDosesAdministeredIndicationDevelopmentData,
  EpidemiologicVaccDosesVaccineDevelopmentData
> {
  readonly simpleGdi = VaccinationSimpleGdi.VACC_DOSES
}
