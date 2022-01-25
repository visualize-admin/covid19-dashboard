import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { SvgModule } from '@shiftcode/ngx-components'
import { ColumnChartModule } from '../../diagrams/column-chart/column-chart.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { NativeSelectModule } from '../../shared/components/native-select/native-select.module'
import { ToggleButtonListModule } from '../../shared/components/toggle-button-list/toggle-button-list.module'
import { WeeklyReportTestposChartComponent } from './content-views/weekly-report-testpos-chart/weekly-report-testpos-chart.component'
import { WeeklyReportTestposTableComponent } from './content-views/weekly-report-testpos-table/weekly-report-testpos-table.component'
import { WeeklyReportCardTestPositivityComponent } from './weekly-report-card-test-positivity.component'

@NgModule({
  declarations: [
    WeeklyReportCardTestPositivityComponent,
    WeeklyReportTestposTableComponent,
    WeeklyReportTestposChartComponent,
  ],
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    NativeSelectModule,
    ReactiveFormsModule,
    ToggleButtonListModule,
    ColumnChartModule,
    SvgModule,
    ChartLegendModule,
  ],
  exports: [WeeklyReportCardTestPositivityComponent],
})
export class WeeklyReportCardTestPositivityModule {}
