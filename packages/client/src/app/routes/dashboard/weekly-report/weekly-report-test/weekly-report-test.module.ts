import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WeeklyReportCardDemographyModule } from '../../../../cards-weekly-report/weekly-report-card-demography/weekly-report-card-demography.module'
import { WeeklyReportCardEpiSummaryModule } from '../../../../cards-weekly-report/weekly-report-card-epi-summary/weekly-report-card-epi-summary.module'
import { WeeklyReportCardGeographyModule } from '../../../../cards-weekly-report/weekly-report-card-geography/weekly-report-card-geography.module'
import { WeeklyReportCardTestPositivityModule } from '../../../../cards-weekly-report/weekly-report-card-test-positivity/weekly-report-card-test-positivity.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { WeeklyReportTestComponent } from './weekly-report-test.component'

@NgModule({
  declarations: [WeeklyReportTestComponent],
  imports: [
    CommonModule,
    CommonsModule,
    WeeklyReportCardGeographyModule,
    WeeklyReportCardDemographyModule,
    WeeklyReportCardTestPositivityModule,
    WeeklyReportCardEpiSummaryModule,
  ],
})
export class WeeklyReportTestModule {}
