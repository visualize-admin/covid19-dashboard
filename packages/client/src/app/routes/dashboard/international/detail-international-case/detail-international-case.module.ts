import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DetailCardInternationalCaseDevelopmentModule } from '../../../../cards-international/detail-card-international-case-development/detail-card-international-case-development.module'
import { DetailCardInternationalCaseGeographyModule } from '../../../../cards-international/detail-card-international-case-geography/detail-card-international-case-geography.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { DetailInternationalCaseComponent } from './detail-international-case.component'

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    DetailCardInternationalCaseGeographyModule,
    DetailCardInternationalCaseDevelopmentModule,
  ],
  declarations: [DetailInternationalCaseComponent],
  exports: [DetailInternationalCaseComponent],
})
export class DetailInternationalCaseModule {}
