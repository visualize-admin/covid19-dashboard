import { Directive, Input } from '@angular/core'

@Directive({
  selector: '[bagChartLegendGroup]',
  host: {
    '[class.chart-legend__group]': 'true',
    '[style.--item-group-gap.px]': 'itemGap',
  },
})
export class ChartLegendGroupDirective {
  @Input() itemGap?: number | null
}
