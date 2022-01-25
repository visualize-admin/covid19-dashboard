import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CommonsModule } from '../../commons/commons.module'
import { RowBarChartComponent } from './row-bar-chart.component'

@NgModule({
  declarations: [RowBarChartComponent],
  imports: [CommonModule, CommonsModule],
  exports: [RowBarChartComponent],
})
export class RowBarChartModule {}
