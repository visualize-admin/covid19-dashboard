import { Component, Input } from '@angular/core'
import { BaseChartLegendItemDirective } from './base-chart-legend-item.directive'

// tslint:disable:component-selector

@Component({
  selector: '[bagChartLegendLine]',
  templateUrl: './chart-legend-item.html',
  host: {
    '[class.chart-legend__line]': '!dashed',
    '[class.chart-legend__dashed-line]': '!!dashed',
    '[style.--c]': 'color',
    '[style.--h.px]': 'thickness',
    '[style.--w.px]': 'length',
    '[style.--g.px]': 'gap',
  },
})
export class ChartLegendLineComponent extends BaseChartLegendItemDirective {
  @Input() color: string
  @Input() thickness?: number | null
  @Input() length?: number | null
  @Input() gap?: number | null
  @Input() dashed?: boolean
}
