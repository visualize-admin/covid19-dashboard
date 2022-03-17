import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { HistogramDetailModule } from '../../diagrams/histogram/histogram-detail/histogram-detail.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { TooltipModule } from '../../shared/components/tooltip/tooltip.module'
import { DetailCardHospCapacityCertifiedBedsComponent } from './detail-card-hosp-capacity-certified-beds.component'

@NgModule({
  imports: [
    CommonModule,
    TooltipModule,
    HistogramDetailModule,
    DetailCardModule,
    CommonsModule,
    ReactiveFormsModule,
    NativeSelectModule,
    ChartLegendModule,
  ],
  declarations: [DetailCardHospCapacityCertifiedBedsComponent],
  exports: [DetailCardHospCapacityCertifiedBedsComponent],
})
export class DetailCardCapacityCertifiedBedsModule {}
