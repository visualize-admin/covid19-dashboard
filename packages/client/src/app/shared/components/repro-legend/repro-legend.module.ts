import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../commons/commons.module'
import { ReproLegendComponent } from './repro-legend.component'

@NgModule({
  imports: [CommonModule, CommonsModule],
  declarations: [ReproLegendComponent],
  exports: [ReproLegendComponent],
})
export class ReproLegendModule {}
