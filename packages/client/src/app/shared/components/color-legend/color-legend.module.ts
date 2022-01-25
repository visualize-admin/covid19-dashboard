import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CommonsModule } from '../../commons/commons.module'
import { ColorLegendComponent } from './color-legend.component'

@NgModule({
  declarations: [ColorLegendComponent],
  imports: [CommonModule, CommonsModule],
  exports: [ColorLegendComponent],
})
export class ColorLegendModule {}
