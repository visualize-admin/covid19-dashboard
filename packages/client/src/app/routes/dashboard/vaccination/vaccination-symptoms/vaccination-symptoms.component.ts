import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
  EpidemiologicVaccSymptomsDemographyData,
  EpidemiologicVaccSymptomsDevelopmentData,
  VaccinationSimpleGdi,
} from '@c19/commons'
import { VaccinationBaseDetailComponent } from '../vaccination-base-detail.component'

@Component({
  selector: 'bag-vaccination-symptoms',
  templateUrl: './vaccination-symptoms.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaccinationSymptomsComponent extends VaccinationBaseDetailComponent<
  undefined,
  EpidemiologicVaccSymptomsDevelopmentData,
  EpidemiologicVaccSymptomsDemographyData,
  undefined,
  undefined,
  undefined
> {
  readonly simpleGdi = VaccinationSimpleGdi.VACC_SYMPTOMS
}
