import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
  EpidemiologicVaccDosesVaccineDevelopmentData,
  EpidemiologicVaccPersonsVaccineDevelopmentData,
  EpidemiologicVaccVaccineDevelopmentData,
  VaccinationStatusVaccineDevelopmentData,
} from '@c19/commons'
import { ShareVaccinationBaseComponent } from '../share-vaccination-base.component'

@Component({
  selector: 'bag-share-vaccination-vaccine',
  templateUrl: './share-vaccination-vaccine.component.html',
  styleUrls: ['../share-vaccination-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareVaccinationVaccineComponent extends ShareVaccinationBaseComponent<EpidemiologicVaccVaccineDevelopmentData> {
  get dosesData(): EpidemiologicVaccDosesVaccineDevelopmentData {
    // @ts-ignore
    return this.data
  }

  get personsData(): EpidemiologicVaccPersonsVaccineDevelopmentData {
    // @ts-ignore
    return this.data
  }

  get vaccinationStatusData(): VaccinationStatusVaccineDevelopmentData {
    // @ts-ignore
    return this.data
  }
}
