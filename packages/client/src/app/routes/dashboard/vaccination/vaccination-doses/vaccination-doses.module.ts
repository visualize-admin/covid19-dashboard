import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DetailCardVaccDosesDemographyModule } from '../../../../cards-vaccination/detail-card-vacc-doses-demography/detail-card-vacc-doses-demography.module'
import { DetailCardVaccDosesDevelopmentModule } from '../../../../cards-vaccination/detail-card-vacc-doses-development/detail-card-vacc-doses-development.module'
import { DetailCardVaccDosesGeographyModule } from '../../../../cards-vaccination/detail-card-vacc-doses-geography/detail-card-vacc-doses-geography.module'
import { DetailCardVaccinationGroupRatioModule } from '../../../../cards-vaccination/detail-card-vaccination-group-ratio/detail-card-vaccination-group-ratio.module'
import { DetailCardVaccDosesIndicationModule } from '../../../../cards-vaccination/detail-card-vacc-doses-indication/detail-card-vacc-doses-indication.module'
import { DetailCardVaccDosesLocationModule } from '../../../../cards-vaccination/detail-card-vacc-doses-location/detail-card-vacc-doses-location.module'
import { DetailCardVaccDosesVaccineModule } from '../../../../cards-vaccination/detail-card-vacc-doses-vaccine/detail-card-vacc-doses-vaccine.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { VaccinationDosesComponent } from './vaccination-doses.component'

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    DetailCardVaccDosesDevelopmentModule,
    DetailCardVaccDosesDemographyModule,
    DetailCardVaccDosesGeographyModule,
    DetailCardVaccDosesLocationModule,
    DetailCardVaccinationGroupRatioModule,
    DetailCardVaccDosesIndicationModule,
    DetailCardVaccDosesVaccineModule,
  ],
  declarations: [VaccinationDosesComponent],
  exports: [VaccinationDosesComponent],
})
export class VaccinationDosesModule {}
