import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { D3SvgModule } from '../../shared/components/d3-svg/d3-svg.module'
import { ColumnChartComponent } from './column-chart.component'

@NgModule({
  declarations: [ColumnChartComponent],
  imports: [CommonModule, D3SvgModule],
  exports: [ColumnChartComponent],
})
export class ColumnChartModule {}
