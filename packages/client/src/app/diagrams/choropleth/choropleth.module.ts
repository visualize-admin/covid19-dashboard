import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../shared/commons/commons.module'
import { D3SvgModule } from '../../shared/components/d3-svg/d3-svg.module'
import { ChoroplethComponent } from './choropleth.component'

@NgModule({
  declarations: [ChoroplethComponent],
  imports: [CommonModule, SvgModule, D3SvgModule, CommonsModule],
  exports: [ChoroplethComponent],
})
export class ChoroplethModule {}
