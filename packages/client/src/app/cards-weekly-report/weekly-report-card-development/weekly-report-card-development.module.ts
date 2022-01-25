import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { HistogramDetailModule } from '../../diagrams/histogram/histogram-detail/histogram-detail.module'
import { HistogramLineModule } from '../../diagrams/histogram/histogram-line/histogram-line.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { WeeklyReportCardDevelopmentComponent } from './weekly-report-card-development.component'

@NgModule({
  declarations: [WeeklyReportCardDevelopmentComponent],
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    HistogramDetailModule,
    HistogramLineModule,
    ChartLegendModule,
  ],
  exports: [WeeklyReportCardDevelopmentComponent],
})
export class WeeklyReportCardDevelopmentModule {}
