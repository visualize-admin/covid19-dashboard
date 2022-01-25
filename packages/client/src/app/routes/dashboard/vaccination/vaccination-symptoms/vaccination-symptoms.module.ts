import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DetailCardVaccSymptomsDemographyModule } from '../../../../cards-vaccination/detail-card-vacc-symptoms-demography/detail-card-vacc-symptoms-demography.module'
import { DetailCardVaccSymptomsDevelopmentModule } from '../../../../cards-vaccination/detail-card-vacc-symptoms-development/detail-card-vacc-symptoms-development.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { VaccinationSymptomsComponent } from './vaccination-symptoms.component'

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    DetailCardVaccSymptomsDevelopmentModule,
    DetailCardVaccSymptomsDemographyModule,
  ],
  declarations: [VaccinationSymptomsComponent],
  exports: [VaccinationSymptomsComponent],
})
export class VaccinationSymptomsModule {}
