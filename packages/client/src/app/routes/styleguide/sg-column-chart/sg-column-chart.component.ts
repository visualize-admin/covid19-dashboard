import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core'
import { CantonGeoUnit } from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { TranslatorService } from '../../../core/i18n/translator.service'
import { ColumnChartElFocusEvent, ColumnChartEntry } from '../../../diagrams/column-chart/column-chart.component'
import { COLORS_COMPARE, COLORS_COMPARE_REF } from '../../../shared/commons/colors.const'
import { TooltipService } from '../../../shared/components/tooltip/tooltip.service'

@Component({
  selector: 'bag-sg-column-chart',
  templateUrl: './sg-column-chart.component.html',
  styleUrls: ['./sg-column-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SgColumnChartComponent {
  @ViewChild('tooltipElRef', { static: true, read: TemplateRef })
  tooltipElRef: TemplateRef<any>

  direction: 'horizontal' | 'vertical' = 'horizontal'
  rotate = false
  data = this.createData()
  refVales = this.createRefValues()
  readonly colors = <[string, string]>COLORS_COMPARE
  readonly refColors = <[string, string]>COLORS_COMPARE_REF

  constructor(private readonly ts: TooltipService, private readonly translator: TranslatorService) {}

  showTooltip({ source, data }: ColumnChartElFocusEvent) {
    this.ts.showTpl(source, this.tooltipElRef, data, {
      position: this.direction === 'horizontal' ? 'above' : ['below', 'above'],
      offsetY: 16,
    })
  }

  hideTooltip() {
    this.ts.hide()
  }

  changeDirection() {
    this.direction = this.direction === 'horizontal' ? 'vertical' : 'horizontal'
  }

  changeRotation() {
    if (this.direction === 'horizontal') {
      this.rotate = !this.rotate
    } else {
      this.rotate = false
    }
  }

  changeData() {
    this.data = this.createData()
    this.refVales = this.createRefValues()
  }

  private createData(): ColumnChartEntry[] {
    return getEnumValues(CantonGeoUnit).map((geoUnit) => {
      const v1 = 1 + Math.random() * 150
      return {
        id: this.translator.get(`GeoFilter.${geoUnit}`),
        values: [v1, Math.max(Math.random() * 20, v1 + Math.random() * (Math.random() > 0.5 ? 20 : -20))],
      }
    })
  }

  private createRefValues(): [number, number] {
    return <[number, number]>(
      this.data
        .reduce(([a, b], i) => [a + (i.values[0] || 0) / 27, b + (i.values[1] || 0) / 27], [0, 0])
        .map((v) => parseFloat(v.toFixed(2)))
    )
  }
}
