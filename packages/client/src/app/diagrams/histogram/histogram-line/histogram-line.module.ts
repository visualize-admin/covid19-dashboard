import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../../shared/commons/commons.module'
import { D3SvgModule } from '../../../shared/components/d3-svg/d3-svg.module'
import { HistogramLineRefInz14dComponent } from './histogram-line-ref-inz14d.component'
import { HistogramLineRefReComponent } from './histogram-line-ref-re.component'
import { HistogramLineRefComponent } from './histogram-line-ref.component'
import { HistogramLineVirusVariantsComponent } from './histogram-line-virus-variants.component'
import { HistogramLineComponent } from './histogram-line.component'

@NgModule({
  imports: [CommonModule, D3SvgModule, CommonsModule],
  declarations: [
    HistogramLineComponent,
    HistogramLineRefComponent,
    HistogramLineRefReComponent,
    HistogramLineRefInz14dComponent,
    HistogramLineVirusVariantsComponent,
  ],
  exports: [
    HistogramLineComponent,
    HistogramLineRefComponent,
    HistogramLineRefReComponent,
    HistogramLineRefInz14dComponent,
    HistogramLineVirusVariantsComponent,
  ],
})
export class HistogramLineModule {}
