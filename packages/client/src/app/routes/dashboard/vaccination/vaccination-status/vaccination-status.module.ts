import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { SvgModule } from '@shiftcode/ngx-components'
import { DetailCardVaccStatusDemographyModule } from '../../../../cards-vaccination/vaccination-status/detail-card-vacc-status-demography/detail-card-vacc-status-demography.module'
import { DetailCardVaccStatusDevelopmentModule } from '../../../../cards-vaccination/vaccination-status/detail-card-vacc-status-development/detail-card-vacc-status-development.module'
import { DetailCardVaccStatusVaccineModule } from '../../../../cards-vaccination/vaccination-status/detail-card-vacc-status-vaccine/detail-card-vacc-status-vaccine.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { SingleSelectModule } from '../../../../shared/components/single-select/single-select.module'
import { VaccinationStatusComponent } from './vaccination-status.component'

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    SingleSelectModule,
    ReactiveFormsModule,
    DetailCardVaccStatusDevelopmentModule,
    DetailCardVaccStatusDemographyModule,
    DetailCardVaccStatusVaccineModule,
    SvgModule,
  ],
  declarations: [VaccinationStatusComponent],
  exports: [VaccinationStatusComponent],
})
export class VaccinationStatusModule {}
