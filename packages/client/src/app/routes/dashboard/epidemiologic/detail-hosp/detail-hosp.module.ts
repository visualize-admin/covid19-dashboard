import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DetailCardEpidemiologicDemographyModule } from '../../../../cards-epidemiologic/detail-card-epidemiologic-demography/detail-card-epidemiologic-demography.module'
import { DetailCardEpidemiologicDevelopmentModule } from '../../../../cards-epidemiologic/detail-card-epidemiologic-development/detail-card-epidemiologic-development.module'
import { DetailCardEpidemiologicGeographyModule } from '../../../../cards-epidemiologic/detail-card-epidemiologic-geography/detail-card-epidemiologic-geography.module'
import { DetailCardEpidemiologicHospCauseModule } from '../../../../cards-epidemiologic/detail-card-epidemiologic-hosp-cause/detail-card-epidemiologic-hosp-cause.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { DetailFilterModule } from '../../../../shared/components/detail-filter/detail-filter.module'
import { DetailHospComponent } from './detail-hosp.component'

@NgModule({
  imports: [
    CommonModule,
    DetailFilterModule,
    CommonsModule,
    DetailCardEpidemiologicDevelopmentModule,
    DetailCardEpidemiologicGeographyModule,
    DetailCardEpidemiologicDemographyModule,
    DetailCardEpidemiologicHospCauseModule,
  ],
  declarations: [DetailHospComponent],
  exports: [DetailHospComponent],
})
export class DetailHospModule {}
