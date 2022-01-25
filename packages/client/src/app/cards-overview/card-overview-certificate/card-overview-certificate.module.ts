import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { HistogramPreviewModule } from '../../diagrams/histogram/histogram-preview/histogram-preview.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { KeyValueListModule } from '../../shared/components/key-value-list/key-value-list.module'
import { OverviewCardModule } from '../../shared/components/overview-card/overview-card.module'
import { CardOverviewCertificateComponent } from './card-overview-certificate.component'

@NgModule({
  declarations: [CardOverviewCertificateComponent],
  imports: [CommonModule, OverviewCardModule, CommonsModule, KeyValueListModule, HistogramPreviewModule],
  exports: [CardOverviewCertificateComponent],
})
export class CardOverviewCertificateModule {}
