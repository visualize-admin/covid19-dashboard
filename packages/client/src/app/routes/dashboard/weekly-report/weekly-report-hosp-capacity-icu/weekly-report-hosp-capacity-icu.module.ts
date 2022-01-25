import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { WeeklyReportCardHospCapacityIcuModule } from '../../../../cards-weekly-report/weekly-report-card-hosp-capacity-icu/weekly-report-card-hosp-capacity-icu.module'
import { WeeklyReportCardSummaryModule } from '../../../../cards-weekly-report/weekly-report-card-summary/weekly-report-card-summary.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { WeeklyReportHospCapacityIcuComponent } from './weekly-report-hosp-capacity-icu.component'

@NgModule({
  declarations: [WeeklyReportHospCapacityIcuComponent],
  imports: [CommonModule, CommonsModule, WeeklyReportCardHospCapacityIcuModule, WeeklyReportCardSummaryModule],
})
export class WeeklyReportHospCapacityIcuModule {}
