import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Component, Input } from '@angular/core'

// tslint:disable:component-selector

@Component({
  selector: '[bagChartLegendDailyValue]',
  host: {
    '[class.chart-legend__daily-value]': 'true',
  },
  template: `
    <div class="chart-legend__daily-value-square" [class.chart-legend__daily-value-square--no-point]="hidePoint"></div>
    <ng-content></ng-content>
  `,
})
export class ChartLegendDailyValueComponent {
  @Input()
  set hidePoint(val: boolean | string) {
    this._hidePoint = coerceBooleanProperty(val)
  }
  get hidePoint(): boolean | string {
    return this._hidePoint
  }

  private _hidePoint: boolean
}
