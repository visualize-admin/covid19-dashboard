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
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { RowBarChartModule } from '../../shared/components/row-bar-chart/row-bar-chart.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { DetailCardVaccDosesDemographyComponent } from './detail-card-vacc-doses-demography.component'

@NgModule({
  declarations: [DetailCardVaccDosesDemographyComponent],
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    ColorLegendModule,
    MatrixStackModule,
    MatrixHeatmapModule,
    RowBarChartModule,
    ToggleButtonListModule,
    ReactiveFormsModule,
    NativeSelectModule,
    HistogramLineModule,
    MultiSelectModule,
    ChartLegendModule,
  ],
  exports: [DetailCardVaccDosesDemographyComponent],
})
export class DetailCardVaccDosesDemographyModule {}
