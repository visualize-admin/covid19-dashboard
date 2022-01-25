import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { HistogramAreaModule } from '../../diagrams/histogram/histogram-area/histogram-area.module'
import { HistogramDetailModule } from '../../diagrams/histogram/histogram-detail/histogram-detail.module'
import { HistogramLineModule } from '../../diagrams/histogram/histogram-line/histogram-line.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { DetailCardVaccPersonsDevelopmentComponent } from './detail-card-vacc-persons-development.component'

@NgModule({
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    HistogramLineModule,
    ToggleButtonListModule,
    ReactiveFormsModule,
    NativeSelectModule,
    HistogramDetailModule,
    HistogramAreaModule,
    ChartLegendModule,
  ],
  declarations: [DetailCardVaccPersonsDevelopmentComponent],
  exports: [DetailCardVaccPersonsDevelopmentComponent],
})
export class DetailCardVaccPersonsDevelopmentModule {}
