import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { ChoroplethCanvasModule } from '../../diagrams/choropleth-canvas/choropleth-canvas.module'
import { HeatmapRowModule } from '../../diagrams/heatmap-row/heatmap-row.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { PaginatorModule } from '../../shared/components/paginator/paginator.module'
import { RangeSliderModule } from '../../shared/components/range-slider/range-slider.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { TooltipModule } from '../../shared/components/tooltip/tooltip.module'
import { DetailCardEpidemiologicGeoRegionsComponent } from './detail-card-epidemiologic-geo-regions.component'

@NgModule({
  declarations: [DetailCardEpidemiologicGeoRegionsComponent],
  imports: [
    CommonModule,
    TooltipModule,
    DetailCardModule,
    CommonsModule,
    SvgModule,
    RouterModule,
    ReactiveFormsModule,
    NativeSelectModule,
    ChartLegendModule,
    PaginatorModule,
    RangeSliderModule,
    HeatmapRowModule,
    ChoroplethCanvasModule,
    ToggleButtonListModule,
  ],
  exports: [DetailCardEpidemiologicGeoRegionsComponent],
})
export class DetailCardEpidemiologicGeoRegionsModule {}
