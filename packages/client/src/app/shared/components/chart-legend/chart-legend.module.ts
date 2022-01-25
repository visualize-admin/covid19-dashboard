import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SvgModule } from '@shiftcode/ngx-components'
import { CommonsModule } from '../../commons/commons.module'
import { ChartLegendDailyValueComponent } from './chart-legend-daily-value.component'
import { ChartLegendGroupDirective } from './chart-legend-group.directive'
import { ChartLegendLabelComponent } from './chart-legend-label.component'
import { ChartLegendLineComponent } from './chart-legend-line.component'
import { ChartLegendMeanLineDirective } from './chart-legend-mean-line.directive'
import { ChartLegendMeanLinesComponent } from './chart-legend-mean-lines.component'
import { ChartLegendSquareComponent } from './chart-legend-square.component'
import { ChartLegendComponent } from './chart-legend.component'

@NgModule({
  declarations: [
    ChartLegendComponent,
    ChartLegendSquareComponent,
    ChartLegendGroupDirective,
    ChartLegendLineComponent,
    ChartLegendLabelComponent,
    ChartLegendDailyValueComponent,
    ChartLegendMeanLinesComponent,
    ChartLegendMeanLineDirective,
  ],
  imports: [CommonModule, CommonsModule, SvgModule],
  exports: [
    ChartLegendComponent,
    ChartLegendSquareComponent,
    ChartLegendGroupDirective,
    ChartLegendLineComponent,
    ChartLegendLabelComponent,
    ChartLegendDailyValueComponent,
    ChartLegendMeanLinesComponent,
    ChartLegendMeanLineDirective,
  ],
})
export class ChartLegendModule {}
