import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../commons/commons.module'
import { Inz14dSumLegendComponent } from './inz14d-sum-legend.component'

@NgModule({
  imports: [CommonModule, CommonsModule],
  declarations: [Inz14dSumLegendComponent],
  exports: [Inz14dSumLegendComponent],
})
export class Inz14dSumLegendModule {}
