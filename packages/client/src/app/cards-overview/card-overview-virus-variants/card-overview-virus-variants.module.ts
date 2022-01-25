import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { HistogramPreviewModule } from '../../diagrams/histogram/histogram-preview/histogram-preview.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { KeyValueListModule } from '../../shared/components/key-value-list/key-value-list.module'
import { OverviewCardModule } from '../../shared/components/overview-card/overview-card.module'
import { CardOverviewVirusVariantsComponent } from './card-overview-virus-variants.component'

@NgModule({
  imports: [CommonModule, OverviewCardModule, CommonsModule, KeyValueListModule, HistogramPreviewModule],
  declarations: [CardOverviewVirusVariantsComponent],
  exports: [CardOverviewVirusVariantsComponent],
})
export class CardOverviewVirusVariantsModule {}
