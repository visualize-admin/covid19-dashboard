import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { HistogramLineModule } from '../../diagrams/histogram/histogram-line/histogram-line.module'
import { MatrixHeatmapModule } from '../../diagrams/matrix/matrix-heatmap/matrix-heatmap.module'
import { MatrixStackModule } from '../../diagrams/matrix/matrix-stack/matrix-stack.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { ColorLegendModule } from '../../shared/components/color-legend/color-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { MultiSelectModule } from '../../shared/components/multi-select/multi-select.module'
import { RowBarChartModule } from '../../shared/components/row-bar-chart/row-bar-chart.module'
import { SingleSelectModule } from '../../shared/components/single-select/single-select.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { DetailCardEpidemiologicDemographyComponent } from './detail-card-epidemiologic-demography.component'

@NgModule({
  declarations: [DetailCardEpidemiologicDemographyComponent],
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    ColorLegendModule,
    MatrixStackModule,
    MatrixHeatmapModule,
    RowBarChartModule,
    HistogramLineModule,
    ToggleButtonListModule,
    ReactiveFormsModule,
    MultiSelectModule,
    ChartLegendModule,
    SingleSelectModule,
  ],
  exports: [DetailCardEpidemiologicDemographyComponent],
})
export class DetailCardEpidemiologicDemographyModule {}
