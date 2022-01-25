import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
  EpidemiologicVaccDosesAdministeredIndicationDevelopmentData,
  EpidemiologicVaccIndicationDevelopmentData,
  EpidemiologicVaccPersonsIndicationDevelopmentData,
} from '@c19/commons'
import { ShareVaccinationBaseComponent } from '../share-vaccination-base.component'

@Component({
  selector: 'bag-share-vaccination-indication',
  templateUrl: './share-vaccination-indication.component.html',
  styleUrls: ['../share-vaccination-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareVaccinationIndicationComponent extends ShareVaccinationBaseComponent<EpidemiologicVaccIndicationDevelopmentData> {
  get dosesData(): EpidemiologicVaccDosesAdministeredIndicationDevelopmentData {
    // @ts-ignore
    return this.data
  }

  get personsData(): EpidemiologicVaccPersonsIndicationDevelopmentData {
    // @ts-ignore
    return this.data
  }
}
