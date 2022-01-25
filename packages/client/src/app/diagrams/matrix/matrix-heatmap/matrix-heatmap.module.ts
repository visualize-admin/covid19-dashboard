import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { D3SvgModule } from '../../../shared/components/d3-svg/d3-svg.module'
import { MatrixHeatmapComponent } from './matrix-heatmap.component'

@NgModule({
  declarations: [MatrixHeatmapComponent],
  imports: [CommonModule, D3SvgModule],
  exports: [MatrixHeatmapComponent],
})
export class MatrixHeatmapModule {}
