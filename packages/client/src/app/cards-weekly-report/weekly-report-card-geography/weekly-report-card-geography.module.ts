import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { ChoroplethModule } from '../../diagrams/choropleth/choropleth.module'
import { ColumnChartModule } from '../../diagrams/column-chart/column-chart.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { ColorLegendModule } from '../../shared/components/color-legend/color-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { WeeklyCompareTableModule } from '../../shared/components/weekly-compare-table/weekly-compare-table.module'
import { WeeklyReportGeoChartComponent } from './content-views/weekly-report-geo-chart/weekly-report-geo-chart.component'
import { WeeklyReportGeoMapComponent } from './content-views/weekly-report-geo-map/weekly-report-geo-map.component'
import { WeeklyReportGeoTableComponent } from './content-views/weekly-report-geo-table/weekly-report-geo-table.component'
import { WeeklyReportCardGeographyComponent } from './weekly-report-card-geography.component'

@NgModule({
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    ChoroplethModule,
    ReactiveFormsModule,
    NativeSelectModule,
    ColorLegendModule,
    ToggleButtonListModule,
    WeeklyCompareTableModule,
    ColumnChartModule,
    ChartLegendModule,
  ],
  declarations: [
    WeeklyReportCardGeographyComponent,
    WeeklyReportGeoTableComponent,
    WeeklyReportGeoMapComponent,
    WeeklyReportGeoChartComponent,
  ],
  exports: [WeeklyReportCardGeographyComponent],
})
export class WeeklyReportCardGeographyModule {}
