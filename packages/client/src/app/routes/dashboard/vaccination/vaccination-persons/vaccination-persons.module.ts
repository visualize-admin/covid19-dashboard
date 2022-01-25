import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DetailCardVaccPersonsDemographyModule } from '../../../../cards-vaccination/detail-card-vacc-persons-demography/detail-card-vacc-persons-demography.module'
import { DetailCardVaccPersonsDevelopmentModule } from '../../../../cards-vaccination/detail-card-vacc-persons-development/detail-card-vacc-persons-development.module'
import { DetailCardVaccPersonsGeographyModule } from '../../../../cards-vaccination/detail-card-vacc-persons-geography/detail-card-vacc-persons-geography.module'
import { DetailCardVaccPersonsIndicationModule } from '../../../../cards-vaccination/detail-card-vacc-persons-indication/detail-card-vacc-persons-indication.module'
import { DetailCardVaccPersonsVaccineModule } from '../../../../cards-vaccination/detail-card-vacc-persons-vaccine/detail-card-vacc-persons-vaccine.module'
import { DetailCardVaccDosesDemographyModule } from '../../../../cards-vaccination/detail-card-vacc-doses-demography/detail-card-vacc-doses-demography.module'
import { DetailCardVaccDosesDevelopmentModule } from '../../../../cards-vaccination/detail-card-vacc-doses-development/detail-card-vacc-doses-development.module'
import { DetailCardVaccDosesGeographyModule } from '../../../../cards-vaccination/detail-card-vacc-doses-geography/detail-card-vacc-doses-geography.module'
import { DetailCardVaccinationGroupRatioModule } from '../../../../cards-vaccination/detail-card-vaccination-group-ratio/detail-card-vaccination-group-ratio.module'
import { DetailCardVaccDosesIndicationModule } from '../../../../cards-vaccination/detail-card-vacc-doses-indication/detail-card-vacc-doses-indication.module'
import { DetailCardVaccDosesVaccineModule } from '../../../../cards-vaccination/detail-card-vacc-doses-vaccine/detail-card-vacc-doses-vaccine.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { VaccinationPersonsComponent } from './vaccination-persons.component'

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    DetailCardVaccDosesGeographyModule,
    DetailCardVaccDosesDevelopmentModule,
    DetailCardVaccDosesDemographyModule,
    DetailCardVaccDosesIndicationModule,
    DetailCardVaccinationGroupRatioModule,
    DetailCardVaccDosesVaccineModule,
    DetailCardVaccPersonsGeographyModule,
    DetailCardVaccPersonsDevelopmentModule,
    DetailCardVaccPersonsVaccineModule,
    DetailCardVaccPersonsDemographyModule,
    DetailCardVaccPersonsIndicationModule,
  ],
  declarations: [VaccinationPersonsComponent],
  exports: [VaccinationPersonsComponent],
})
export class VaccinationPersonsModule {}
