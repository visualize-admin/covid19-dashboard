import { Component, Input } from '@angular/core'
import { BaseChartLegendItemDirective } from './base-chart-legend-item.directive'

// tslint:disable:component-selector

@Component({
  selector: '[bagChartLegendMeanLines]',
  templateUrl: './chart-legend-item.html',
  host: {
    '[class.chart-legend__mean-lines]': 'true',
    '[style.--mean-label-gap.px]': 'labelGap',
  },
})
export class ChartLegendMeanLinesComponent extends BaseChartLegendItemDirective {
  @Input() labelGap?: number | null
}
