import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { HistogramPreviewModule } from '../../diagrams/histogram/histogram-preview/histogram-preview.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { KeyValueListModule } from '../../shared/components/key-value-list/key-value-list.module'
import { OverviewCardModule } from '../../shared/components/overview-card/overview-card.module'
import { CardOverviewCaseComponent } from './card-overview-case.component'

@NgModule({
  declarations: [CardOverviewCaseComponent],
  imports: [
    CommonModule,
    KeyValueListModule,
    OverviewCardModule,
    CommonsModule,
    HistogramPreviewModule,
    ChartLegendModule,
  ],
  exports: [CardOverviewCaseComponent],
})
export class CardOverviewCaseModule {}
