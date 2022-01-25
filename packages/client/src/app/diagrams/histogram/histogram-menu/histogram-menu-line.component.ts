import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { Line, Selection } from 'd3'
import { COLOR_DIAGRAM_TICK_LINE, COLOR_DIAGRAM_TICK_TEXT } from '../../../shared/commons/colors.const'
import { adminFormatNum } from '../../../static-utils/admin-format-num.function'
import { BaseHistogramComponent, HistogramEntry } from '../base-histogram.component'

export interface HistogramMenuLineEntry extends HistogramEntry {
  value: number | null
}

@Component({
  selector: 'bag-histogram-menu-line',
  templateUrl: './histogram-menu.component.html',
  styleUrls: ['./histogram-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramMenuLineComponent<T extends HistogramMenuLineEntry> extends BaseHistogramComponent<T> {
  @Input()
  override set data(data: T[]) {
    super.data = data
    this.yMaxValue = Math.max(1, ...data.reduce((u, i) => [...u, i.value || 0], <number[]>[]))
  }

  override get data() {
    return super.data
  }

  @Input()
  extraLabelAt: number

  @Input()
  lineColor?: string

  protected yMaxValue: number
  protected yTickCount = 1
  protected override margin = { top: 16, right: 0, bottom: 16, left: 0 }
  protected pathEl: Selection<SVGPathElement, void, null, void>
  protected readonly lineFn: Line<T> = this.createLine((v) => v.value)
  protected extraLabel: Selection<SVGTextElement, void, null, void>

  protected override setupChart() {
    super.setupChart()
    this.yAxisGrp.attr('font-size', 10).attr('text-anchor', 'start')
    this.xAxisGrp.attr('fill', COLOR_DIAGRAM_TICK_TEXT).attr('font-size', 10)
    this.xAxisLine.attr('stroke', COLOR_DIAGRAM_TICK_LINE)
    this.pathEl = this.dataGrp
      .attr('fill', 'none')
      .attr('stroke', this.lineColor ? this.lineColor : '#428BD3')
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .append('path')
    this.extraLabel = this.svg.svg
      .append('text')
      .attr('font-size', 10)
      .attr('style', 'text-shadow: 2px 0 1px white, -2px 0 1px white, 0 2px 1px white, 0 -2px 1px white;')
      .attr('dy', -4)
  }

  protected paint() {
    this.drawMinimalXAxis()
    this.drawYAxis()
    this.drawLine()
    if (this.extraLabelAt) {
      this.extraLabel
        .attr('transform', `translate(0, ${this.scaleLinearY(this.extraLabelAt)})`)
        .text(adminFormatNum(this.extraLabelAt))
    }
  }

  protected drawYAxis() {
    const yEnd = this.scaleLinearY.domain()[1]
    const labelsData = !this.extraLabelAt || yEnd === this.extraLabelAt ? [yEnd] : [this.extraLabelAt, yEnd]
    const idFn = (v: number) => v

    this.yAxisGrp
      .selectAll('g')
      .data(labelsData, <any>idFn)
      .join((group) => {
        const g = group.append('g')
        g.append('line')
        g.append('text')
          .attr('dy', -4)
          .text((v) => (this.yLabelFormatter || adminFormatNum)(v))
        return g
      })
      .attr('transform', (y) => `translate(0, ${this.scaleLinearY(y)})`)
      .select('line')
      .attr('x2', (v: number) => (v === this.extraLabelAt ? this.svg.width - this.margin.right : 8))
      .attr('stroke', (v: number) => (v === this.extraLabelAt ? '#000' : '#e5e5e5'))
  }

  protected drawLine() {
    this.pathEl.attr('d', <string>this.lineFn(this.data))
  }
}
