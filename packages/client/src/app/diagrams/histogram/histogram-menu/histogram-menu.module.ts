import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { D3SvgModule } from '../../../shared/components/d3-svg/d3-svg.module'
import { HistogramMenuLineComponent } from './histogram-menu-line.component'
import { HistogramMenuComponent } from './histogram-menu.component'

@NgModule({
  declarations: [HistogramMenuComponent, HistogramMenuLineComponent],
  imports: [CommonModule, D3SvgModule],
  exports: [HistogramMenuComponent, HistogramMenuLineComponent],
})
export class HistogramMenuModule {}
