import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../shared/commons/commons.module'
import { D3CanvasModule } from '../../shared/components/d3-canvas/d3-canvas.module'
import { D3SvgModule } from '../../shared/components/d3-svg/d3-svg.module'
import { ChoroplethCanvasComponent } from './choropleth-canvas.component'

@NgModule({
  declarations: [ChoroplethCanvasComponent],
  imports: [CommonModule, SvgModule, D3SvgModule, CommonsModule, D3CanvasModule],
  exports: [ChoroplethCanvasComponent],
})
export class ChoroplethCanvasModule {}
