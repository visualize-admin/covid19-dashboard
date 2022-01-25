import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { D3SvgModule } from '../../../shared/components/d3-svg/d3-svg.module'
import { MatrixStackComponent } from './matrix-stack.component'

@NgModule({
  imports: [CommonModule, D3SvgModule],
  declarations: [MatrixStackComponent],
  exports: [MatrixStackComponent],
})
export class MatrixStackModule {}
