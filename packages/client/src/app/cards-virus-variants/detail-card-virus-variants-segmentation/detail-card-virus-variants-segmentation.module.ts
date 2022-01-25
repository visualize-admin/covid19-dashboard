import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { HistogramDetailModule } from '../../diagrams/histogram/histogram-detail/histogram-detail.module'
import { HistogramLineModule } from '../../diagrams/histogram/histogram-line/histogram-line.module'
import { HistogramPreviewModule } from '../../diagrams/histogram/histogram-preview/histogram-preview.module'
import { CommonsModule } from '../../shared/commons/commons.module'
import { ChartLegendModule } from '../../shared/components/chart-legend/chart-legend.module'
import { DetailCardModule } from '../../shared/components/detail-card/detail-card.module'
import { MultiSelectModule } from '../../shared/components/multi-select/multi-select.module'
import { DetailCardVirusVariantsSegmentationComponent } from './detail-card-virus-variants-segmentation.component'

@NgModule({
  declarations: [DetailCardVirusVariantsSegmentationComponent],
  imports: [
    CommonModule,
    DetailCardModule,
    CommonsModule,
    HistogramLineModule,
    MultiSelectModule,
    ReactiveFormsModule,
    ChartLegendModule,
    HistogramDetailModule,
    HistogramPreviewModule,
    RouterModule,
  ],
  exports: [DetailCardVirusVariantsSegmentationComponent],
})
export class DetailCardVirusVariantsSegmentationModule {}
