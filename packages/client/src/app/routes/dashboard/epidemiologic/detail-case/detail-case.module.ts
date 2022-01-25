import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { DetailCardModule } from '../../../../shared/components/detail-card/detail-card.module'
import { DetailFilterModule } from '../../../../shared/components/detail-filter/detail-filter.module'
import { DetailCaseComponent } from './detail-case.component'
import { DetailCardEpidemiologicDemographyModule } from '../../../../cards-epidemiologic/detail-card-epidemiologic-demography/detail-card-epidemiologic-demography.module'
import { DetailCardEpidemiologicDevelopmentModule } from '../../../../cards-epidemiologic/detail-card-epidemiologic-development/detail-card-epidemiologic-development.module'
import { DetailCardEpidemiologicGeographyModule } from '../../../../cards-epidemiologic/detail-card-epidemiologic-geography/detail-card-epidemiologic-geography.module'

@NgModule({
  imports: [
    CommonModule,
    DetailCardEpidemiologicDemographyModule,
    DetailCardEpidemiologicDevelopmentModule,
    DetailCardModule,
    DetailFilterModule,
    CommonsModule,
    DetailCardEpidemiologicGeographyModule,
  ],
  declarations: [DetailCaseComponent],
  exports: [DetailCaseComponent],
})
export class DetailCaseModule {}
