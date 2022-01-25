import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { SvgModule } from '@shiftcode/ngx-components'
import { HistogramPreviewModule } from '../../diagrams/histogram/histogram-preview/histogram-preview.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { KeyValueListModule } from '../../shared/components/key-value-list/key-value-list.module'
import { OverviewCardModule } from '../../shared/components/overview-card/overview-card.module'
import { CardOverviewDeathComponent } from './card-overview-death.component'

@NgModule({
  declarations: [CardOverviewDeathComponent],
  imports: [
    CommonModule,
    OverviewCardModule,
    CommonsModule,
    KeyValueListModule,
    HistogramPreviewModule,
    ChartLegendModule,
    SvgModule,
    RouterModule,
  ],
  exports: [CardOverviewDeathComponent],
})
export class CardOverviewDeathModule {}
