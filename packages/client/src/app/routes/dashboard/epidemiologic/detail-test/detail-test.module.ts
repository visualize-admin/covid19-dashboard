import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DetailCardEpidemiologicDemographyModule } from '../../../../cards-epidemiologic/detail-card-epidemiologic-demography/detail-card-epidemiologic-demography.module'
import { DetailCardEpidemiologicDevelopmentModule } from '../../../../cards-epidemiologic/detail-card-epidemiologic-development/detail-card-epidemiologic-development.module'
import { DetailCardEpidemiologicGeographyModule } from '../../../../cards-epidemiologic/detail-card-epidemiologic-geography/detail-card-epidemiologic-geography.module'
import { DetailCardEpidemiologicTestPositivityModule } from '../../../../cards-epidemiologic/detail-card-epidemiologic-test-positivity/detail-card-epidemiologic-test-positivity.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { DetailFilterModule } from '../../../../shared/components/detail-filter/detail-filter.module'
import { DetailTestComponent } from './detail-test.component'

@NgModule({
  declarations: [DetailTestComponent],
  imports: [
    CommonModule,
    CommonsModule,
    DetailFilterModule,
    DetailCardEpidemiologicGeographyModule,
    DetailCardEpidemiologicDevelopmentModule,
    DetailCardEpidemiologicDemographyModule,
    DetailCardEpidemiologicTestPositivityModule,
  ],
  exports: [DetailTestComponent],
})
export class DetailTestModule {}
