import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { DetailCardCapacityCertifiedBedsModule } from '../../../../cards-hosp-capacity/detail-card-hosp-capacity-certified-beds/detail-card-capacity-certified-beds.module'
import { DetailCardCapacityDevelopmentModule } from '../../../../cards-hosp-capacity/detail-card-hosp-capacity-development/detail-card-capacity-development.module'
import { DetailCardCapacityGeographyModule } from '../../../../cards-hosp-capacity/detail-card-hosp-capacity-geography/detail-card-capacity-geography.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { DetailIntensiveComponent } from './detail-intensive.component'

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    DetailCardCapacityGeographyModule,
    DetailCardCapacityDevelopmentModule,
    DetailCardCapacityCertifiedBedsModule,
  ],
  declarations: [DetailIntensiveComponent],
  exports: [DetailIntensiveComponent],
})
export class DetailIntensiveModule {}
