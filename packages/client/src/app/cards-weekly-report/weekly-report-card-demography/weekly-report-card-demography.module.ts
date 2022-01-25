import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { DetailCardEpidemiologicDemographyModule } from '../../cards-epidemiologic/detail-card-epidemiologic-demography/detail-card-epidemiologic-demography.module'
import { ColumnChartModule } from '../../diagrams/column-chart/column-chart.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { RowBarChartModule } from '../../shared/components/row-bar-chart/row-bar-chart.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { WeeklyCompareTableModule } from '../../shared/components/weekly-compare-table/weekly-compare-table.module'
import { WeeklyReportDemoChartComponent } from './content-views/weekly-report-demo-chart/weekly-report-demo-chart.component'
import { WeeklyReportDemoTableComponent } from './content-views/weekly-report-demo-table/weekly-report-demo-table.component'
import { WeeklyReportCardDemographyComponent } from './weekly-report-card-demography.component'

@NgModule({
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    ReactiveFormsModule,
    NativeSelectModule,
    DetailCardEpidemiologicDemographyModule,
    RowBarChartModule,
    ToggleButtonListModule,
    ColumnChartModule,
    WeeklyCompareTableModule,
    ChartLegendModule,
  ],
  declarations: [WeeklyReportCardDemographyComponent, WeeklyReportDemoChartComponent, WeeklyReportDemoTableComponent],
  exports: [WeeklyReportCardDemographyComponent],
})
export class WeeklyReportCardDemographyModule {}
