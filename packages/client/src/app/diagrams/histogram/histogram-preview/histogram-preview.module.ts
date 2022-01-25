import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { D3SvgModule } from '../../../shared/components/d3-svg/d3-svg.module'
import { HistogramPreviewAreaComponent } from './histogram-preview-area.component'
import { HistogramPreviewReComponent } from './histogram-preview-re.component'
import { HistogramPreviewComponent } from './histogram-preview.component'
import { HistogramPreviewLinesComponent } from './histogram-preview-lines.component'

@NgModule({
  declarations: [
    HistogramPreviewComponent,
    HistogramPreviewReComponent,
    HistogramPreviewLinesComponent,
    HistogramPreviewAreaComponent,
  ],
  imports: [CommonModule, D3SvgModule],
  exports: [
    HistogramPreviewComponent,
    HistogramPreviewReComponent,
    HistogramPreviewLinesComponent,
    HistogramPreviewAreaComponent,
  ],
})
export class HistogramPreviewModule {}
