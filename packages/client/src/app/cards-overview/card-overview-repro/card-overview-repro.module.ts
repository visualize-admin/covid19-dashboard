import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HistogramPreviewModule } from '../../diagrams/histogram/histogram-preview/histogram-preview.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { KeyValueListModule } from '../../shared/components/key-value-list/key-value-list.module'
import { OverviewCardModule } from '../../shared/components/overview-card/overview-card.module'
import { ReproLegendModule } from '../../shared/components/repro-legend/repro-legend.module'
import { CardOverviewReproComponent } from './card-overview-repro.component'

@NgModule({
  declarations: [CardOverviewReproComponent],
  imports: [
    CommonModule,
    OverviewCardModule,
    CommonsModule,
    KeyValueListModule,
    HistogramPreviewModule,
    ReproLegendModule,
  ],
  exports: [CardOverviewReproComponent],
})
export class CardOverviewReproModule {}
