import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { D3SvgModule } from '../../../shared/components/d3-svg/d3-svg.module'
import { HistogramDetailComponent } from './histogram-detail.component'

@NgModule({
  declarations: [HistogramDetailComponent],
  imports: [CommonModule, D3SvgModule, CommonsModule],
  exports: [HistogramDetailComponent],
})
export class HistogramDetailModule {}
