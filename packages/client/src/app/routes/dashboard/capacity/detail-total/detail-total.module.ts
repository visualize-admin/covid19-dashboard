import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DetailCardCapacityDevelopmentModule } from '../../../../cards-hosp-capacity/detail-card-hosp-capacity-development/detail-card-capacity-development.module'
import { DetailCardCapacityGeographyModule } from '../../../../cards-hosp-capacity/detail-card-hosp-capacity-geography/detail-card-capacity-geography.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { DetailTotalComponent } from './detail-total.component'

@NgModule({
  imports: [CommonModule, CommonsModule, DetailCardCapacityGeographyModule, DetailCardCapacityDevelopmentModule],
  declarations: [DetailTotalComponent],
  exports: [DetailTotalComponent],
})
export class DetailTotalModule {}
