import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../shared/commons/commons.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { TextTableEasyModule } from '../../shared/components/text-table-easy/text-table-easy.module'
import { WeeklyReportCardEpiSummaryComponent } from './weekly-report-card-epi-summary.component'

@NgModule({
  declarations: [WeeklyReportCardEpiSummaryComponent],
  imports: [CommonModule, DetailCardModule, CommonsModule, TextTableEasyModule],
  exports: [WeeklyReportCardEpiSummaryComponent],
})
export class WeeklyReportCardEpiSummaryModule {}
