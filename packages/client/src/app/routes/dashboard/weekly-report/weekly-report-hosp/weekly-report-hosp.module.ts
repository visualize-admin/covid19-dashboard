import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { WeeklyReportCardDemographyModule } from '../../../../cards-weekly-report/weekly-report-card-demography/weekly-report-card-demography.module'
import { WeeklyReportCardEpiSummaryModule } from '../../../../cards-weekly-report/weekly-report-card-epi-summary/weekly-report-card-epi-summary.module'
import { WeeklyReportCardGeographyModule } from '../../../../cards-weekly-report/weekly-report-card-geography/weekly-report-card-geography.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { WeeklyReportHospComponent } from './weekly-report-hosp.component'

@NgModule({
  imports: [
    CommonModule,
    CommonsModule,
    WeeklyReportCardGeographyModule,
    WeeklyReportCardDemographyModule,
    WeeklyReportCardEpiSummaryModule,
  ],
  declarations: [WeeklyReportHospComponent],
  exports: [WeeklyReportHospComponent],
})
export class WeeklyReportHospModule {}
