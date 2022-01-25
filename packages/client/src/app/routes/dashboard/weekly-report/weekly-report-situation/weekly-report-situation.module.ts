import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { WeeklyReportCardDevelopmentModule } from '../../../../cards-weekly-report/weekly-report-card-development/weekly-report-card-development.module'
import { WeeklyReportCardOverviewModule } from '../../../../cards-weekly-report/weekly-report-card-overview/weekly-report-card-overview.module'
import { WeeklyReportCardSummaryModule } from '../../../../cards-weekly-report/weekly-report-card-summary/weekly-report-card-summary.module'
import { CommonsModule } from '../../../../shared/commons/commons.module'
import { WeeklyReportSituationComponent } from './weekly-report-situation.component'

@NgModule({
  declarations: [WeeklyReportSituationComponent],
  imports: [
    CommonModule,
    CommonsModule,
    WeeklyReportCardSummaryModule,
    WeeklyReportCardOverviewModule,
    WeeklyReportCardDevelopmentModule,
  ],
  exports: [WeeklyReportSituationComponent],
})
export class WeeklyReportSituationModule {}
