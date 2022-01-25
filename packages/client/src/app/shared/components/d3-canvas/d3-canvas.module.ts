import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { D3CanvasComponent } from './d3-canvas.component'

@NgModule({
  imports: [CommonModule],
  declarations: [D3CanvasComponent],
  exports: [D3CanvasComponent],
})
export class D3CanvasModule {}
