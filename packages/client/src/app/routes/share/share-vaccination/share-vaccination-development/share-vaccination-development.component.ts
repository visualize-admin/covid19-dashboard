import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
  EpidemiologicVaccDosesDevelopmentData,
  EpidemiologicVaccPersonsDevelopmentData,
  EpidemiologicVaccSymptomsDevelopmentData,
  VaccinationStatusDevelopmentData,
} from '@c19/commons'
import { ShareVaccinationBaseComponent } from '../share-vaccination-base.component'

@Component({
  selector: 'bag-share-vaccination-development',
  templateUrl: './share-vaccination-development.component.html',
  styleUrls: ['../share-vaccination-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareVaccinationDevelopmentComponent extends ShareVaccinationBaseComponent<
  | EpidemiologicVaccDosesDevelopmentData
  | EpidemiologicVaccPersonsDevelopmentData
  | EpidemiologicVaccSymptomsDevelopmentData
  | VaccinationStatusDevelopmentData
> {
  // ng template check does not work correctly so we need getters for casting
  get dosesData(): EpidemiologicVaccDosesDevelopmentData {
    // casting would be removed from tslint. therefore ts-ignore is used
    // @ts-ignore
    return this.data
  }

  // ng template check does not work correctly so we need getters for casting
  get personsData(): EpidemiologicVaccPersonsDevelopmentData {
    // casting would be removed from tslint. therefore ts-ignore is used
    // @ts-ignore
    return this.data
  }

  // ng template check does not work correctly so we need getters for casting
  get symptomsData(): EpidemiologicVaccSymptomsDevelopmentData {
    // casting would be removed from tslint. therefore ts-ignore is used
    // @ts-ignore
    return this.data
  }

  get vaccinationStatusData(): VaccinationStatusDevelopmentData {
    // casting would be removed from tslint. therefore ts-ignore is used
    // @ts-ignore
    return this.data
  }
}
