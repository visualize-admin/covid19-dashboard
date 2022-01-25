import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ChoroplethCanvasModule } from '../../diagrams/choropleth-canvas/choropleth-canvas.module'
import { ChoroplethModule } from '../../diagrams/choropleth/choropleth.module'
import { ColumnChartModule } from '../../diagrams/column-chart/column-chart.module'
import { HeatmapRowModule } from '../../diagrams/heatmap-row/heatmap-row.module'
import { HistogramAreaModule } from '../../diagrams/histogram/histogram-area/histogram-area.module'
import { HistogramDetailModule } from '../../diagrams/histogram/histogram-detail/histogram-detail.module'
import { HistogramLineModule } from '../../diagrams/histogram/histogram-line/histogram-line.module'
import { HistogramMenuModule } from '../../diagrams/histogram/histogram-menu/histogram-menu.module'
import { HistogramPreviewModule } from '../../diagrams/histogram/histogram-preview/histogram-preview.module'
import { MatrixHeatmapModule } from '../../diagrams/matrix/matrix-heatmap/matrix-heatmap.module'
import { MatrixStackModule } from '../../diagrams/matrix/matrix-stack/matrix-stack.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { MultiSelectModule } from '../../shared/components/multi-select/multi-select.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { OptionModule } from '../../shared/components/option/option.module'
import { PaginatorModule } from '../../shared/components/paginator/paginator.module'
import { RangeSliderModule } from '../../shared/components/range-slider/range-slider.module'
import { ShareLinkModule } from '../../shared/components/share-link/share-link.module'
import { TabListModule } from '../../shared/components/tab-list/tab-list.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { WeeklyCompareTableModule } from '../../shared/components/weekly-compare-table/weekly-compare-table.module'
import { LoremDirective } from './lorem.directive'
import { SgChoroplethComponent } from './sg-choropleth/sg-choropleth.component'
import { SgColumnChartComponent } from './sg-column-chart/sg-column-chart.component'
import { SgComponentsComponent } from './sg-components/sg-components.component'
import { SgHeatmapRowComponent } from './sg-heatmap-row/sg-heatmap-row.component'
import { SgHistogramComponent } from './sg-histogram/sg-histogram.component'
import { SgMatrixDiagramsComponent } from './sg-matrix-diagrams/sg-matrix-diagrams.component'
import { SgTypographyComponent } from './sg-typography/sg-typography.component'
import { StyleguideComponent } from './styleguide.component'
import { StyleguideRouterModule } from './styleguide.routes'

@NgModule({
  declarations: [
    StyleguideComponent,
    SgTypographyComponent,
    LoremDirective,
    SgHistogramComponent,
    SgMatrixDiagramsComponent,
    SgComponentsComponent,
    SgChoroplethComponent,
    SgColumnChartComponent,
    SgHeatmapRowComponent,
  ],
  imports: [
    CommonModule,
    StyleguideRouterModule,
    TabListModule,
    CommonsModule,
    ShareLinkModule,
    MatrixHeatmapModule,
    MatrixStackModule,
    HistogramMenuModule,
    HistogramPreviewModule,
    HistogramLineModule,
    HistogramDetailModule,
    ChoroplethModule,
    ToggleButtonListModule,
    ReactiveFormsModule,
    ColumnChartModule,
    WeeklyCompareTableModule,
    MultiSelectModule,
    OptionModule,
    HistogramAreaModule,
    ChoroplethCanvasModule,
    NativeSelectModule,
    PaginatorModule,
    RangeSliderModule,
    HeatmapRowModule,
    ChartLegendModule,
  ],
})
export class StyleguideModule {}
