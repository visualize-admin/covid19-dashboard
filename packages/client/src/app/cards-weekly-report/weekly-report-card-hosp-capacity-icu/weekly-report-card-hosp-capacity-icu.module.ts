import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ColumnChartModule } from '../../diagrams/column-chart/column-chart.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { TextTableEasyModule } from '../../shared/components/text-table-easy/text-table-easy.module'
import { WeeklyReportCardHospCapacityIcuComponent } from './weekly-report-card-hosp-capacity-icu.component'
import { WeeklyReportHospCapacityIcuChartComponent } from './weekly-report-hosp-capacity-icu-chart/weekly-report-hosp-capacity-icu-chart.component'

@NgModule({
  declarations: [WeeklyReportCardHospCapacityIcuComponent, WeeklyReportHospCapacityIcuChartComponent],
  imports: [CommonModule, DetailCardModule, CommonsModule, TextTableEasyModule, ChartLegendModule, ColumnChartModule],
  exports: [WeeklyReportCardHospCapacityIcuComponent],
})
export class WeeklyReportCardHospCapacityIcuModule {}
