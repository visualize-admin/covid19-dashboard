import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
  EpidemiologicVaccDemographyData,
  EpidemiologicVaccDemographyDataV2,
  EpidemiologicVaccSymptomsDemographyData,
  VaccinationStatusDemographyData,
} from '@c19/commons'
import { ShareVaccinationBaseComponent } from '../share-vaccination-base.component'

@Component({
  selector: 'bag-share-vaccination-demography',
  templateUrl: './share-vaccination-demography.component.html',
  styleUrls: ['../share-vaccination-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareVaccinationDemographyComponent extends ShareVaccinationBaseComponent<
  EpidemiologicVaccDemographyData | VaccinationStatusDemographyData
> {
  get dosesData(): EpidemiologicVaccDemographyData {
    // @ts-ignore
    return this.data
  }

  get personsData(): EpidemiologicVaccDemographyDataV2 {
    // @ts-ignore
    return this.data
  }

  get symptomsData(): EpidemiologicVaccSymptomsDemographyData {
    // @ts-ignore
    return this.data
  }

  get vaccinationStatusData(): VaccinationStatusDemographyData {
    // @ts-ignore
    return this.data
  }
}
