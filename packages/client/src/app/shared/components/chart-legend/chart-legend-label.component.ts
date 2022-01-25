import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { BaseChartLegendItemDirective } from './base-chart-legend-item.directive'

// tslint:disable:component-selector

@Component({
  selector: '[bagChartLegendLabel]',
  templateUrl: './chart-legend-item.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.chart-legend__label]': 'true',
    '[class.chart-legend__label--with-tooltip]': 'hasTooltip',
  },
})
export class ChartLegendLabelComponent extends BaseChartLegendItemDirective {}
