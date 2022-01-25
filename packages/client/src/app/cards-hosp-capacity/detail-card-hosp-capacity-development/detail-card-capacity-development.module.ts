import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { SvgModule } from '@shiftcode/ngx-components'
import { HistogramDetailModule } from '../../diagrams/histogram/histogram-detail/histogram-detail.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { TooltipModule } from '../../shared/components/tooltip/tooltip.module'
import { DetailCardHospCapacityDevelopmentComponent } from './detail-card-hosp-capacity-development.component'

@NgModule({
  imports: [
    CommonModule,
    TooltipModule,
    HistogramDetailModule,
    DetailCardModule,
    CommonsModule,
    ToggleButtonListModule,
    ReactiveFormsModule,
    NativeSelectModule,
    SvgModule,
    ChartLegendModule,
  ],
  declarations: [DetailCardHospCapacityDevelopmentComponent],
  exports: [DetailCardHospCapacityDevelopmentComponent],
})
export class DetailCardCapacityDevelopmentModule {}
