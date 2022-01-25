import { Directive, Input } from '@angular/core'

// tslint:disable:no-host-metadata-property

@Directive({
  selector: '[bagChartLegendMeanLine]',
  host: {
    '[class.chart-legend__mean-line]': 'true',
    '[style.--c]': 'color',
    '[style.--h.px]': 'thickness',
    '[style.--w.px]': 'length',
  },
})
export class ChartLegendMeanLineDirective {
  @Input() color: string
  @Input() thickness?: number | null
  @Input() length?: number | null
}
