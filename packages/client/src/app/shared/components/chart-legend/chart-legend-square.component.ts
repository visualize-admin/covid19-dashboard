import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Component, Input } from '@angular/core'
import { BaseChartLegendItemDirective } from './base-chart-legend-item.directive'

// tslint:disable:component-selector

@Component({
  selector: '[bagChartLegendSquare]',
  templateUrl: './chart-legend-item.html',
  host: {
    '[class.chart-legend__square]': 'true',
    '[class.chart-legend__square--no-data]': 'noData',
    '[class.chart-legend__square--no-case]': 'noCase',
    '[class.chart-legend__square--pattern]': 'pattern',
    '[style.--c]': '(noData||noCase) ? null : color',
    '[style.--w.px]': 'length',
    '[style.--h.px]': 'height',
    '[style.--g.px]': 'gap',
  },
})
export class ChartLegendSquareComponent extends BaseChartLegendItemDirective {
  @Input() length?: number | null
  @Input() height?: number | null
  @Input() gap?: number | null

  @Input()
  set noData(val: boolean | string) {
    this._noData = coerceBooleanProperty(val)
  }
  get noData(): boolean | string {
    return this._noData
  }

  @Input()
  set noCase(val: boolean | string) {
    this._noCase = coerceBooleanProperty(val)
  }
  get noCase(): boolean | string {
    return this._noCase
  }

  @Input()
  set pattern(val: boolean | string) {
    this._pattern = coerceBooleanProperty(val)
  }
  get pattern(): boolean | string {
    return this._pattern
  }

  @Input() color: string

  private _noData: boolean
  private _noCase: boolean
  private _pattern: boolean
}
