import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../commons/commons.module'
import { QuarantineLegendComponent } from './quarantine-legend.component'

@NgModule({
  imports: [CommonModule, CommonsModule],
  declarations: [QuarantineLegendComponent],
  exports: [QuarantineLegendComponent],
})
export class QuarantineLegendModule {}
