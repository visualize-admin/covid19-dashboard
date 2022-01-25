import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { HistogramDetailModule } from '../../diagrams/histogram/histogram-detail/histogram-detail.module'
import { HistogramLineModule } from '../../diagrams/histogram/histogram-line/histogram-line.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { Inz14dSumLegendModule } from '../../shared/components/inz14d-sum-legend/inz14d-sum-legend.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { TooltipModule } from '../../shared/components/tooltip/tooltip.module'
import { DetailCardEpidemiologicDevelopmentComponent } from './detail-card-epidemiologic-development.component'

@NgModule({
  declarations: [DetailCardEpidemiologicDevelopmentComponent],
  imports: [
    CommonModule,
    CommonsModule,
    TooltipModule,
    HistogramDetailModule,
    DetailCardModule,
    ToggleButtonListModule,
    ReactiveFormsModule,
    HistogramLineModule,
    NativeSelectModule,
    Inz14dSumLegendModule,
    ChartLegendModule,
  ],
  exports: [DetailCardEpidemiologicDevelopmentComponent],
})
export class DetailCardEpidemiologicDevelopmentModule {}
