import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { isDefined } from '@c19/commons'
import { Line, Selection } from 'd3'
import { createRangePathArea } from '../../utils'
import { HistogramBandEntry } from '../base-histogram.component'
import { BaseHistogramPreviewComponent } from './base-histogram-preview.component'

export interface HistogramPreviewLinesEntry extends HistogramBandEntry {
  values: (number | null)[]
}

@Component({
  selector: 'bag-histogram-preview-lines',
  templateUrl: './histogram-preview.component.html',
  styleUrls: ['./histogram-preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramPreviewLinesComponent<
  T extends HistogramPreviewLinesEntry,
> extends BaseHistogramPreviewComponent<T> {
  @Input()
  override set data(data: T[]) {
    super.data = data
    const allValues = data.reduce((u, i) => [...u, ...i.values.map((v) => v || 0)], <number[]>[])
    this.noValues = allValues.length === 0
    this.yMaxValue = Math.max(1, ...allValues)
    this.lineFunctions = new Array(this.data.reduce((u, i) => Math.max(u, i.values.length), 0))
      .fill(0)
      .map((_, ix) => [ix, this.createLine((v) => v.values[ix])])
  }

  override get data() {
    return super.data
  }

  @Input()
  noDataLabel?: string

  @Input()
  colors: string[]

  @Input()
  strokeWidths: number | number[]

  protected yMaxValue: number
  protected noValues: boolean
  protected rangePath: Selection<SVGPathElement, void, null, undefined>

  protected lineFunctions: Array<[number, Line<T>]>

  protected override setupChart() {
    super.setupChart()
    this.rangePath = this.dataGrp.append('path').attr('class', 'range').attr('fill', '#ccc').attr('opacity', 0.5)
    this.dataGrp
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .raise()
  }

  protected paint(): void {
    this.drawMinimalXAxis()
    this.drawPreviewYAxis(this.noValues)
    this.drawRange()
    this.drawNoDataLabel(this.noValues, this.noDataLabel || 'n/A')
    this.drawLines()
  }

  protected drawLines() {
    const valuesCount = this.data.filter((v) => v.values.some(isDefined)).length

    const strokeWidthsArg = this.strokeWidths // put into local var for proper type checks

    // stroke width 6 if only one data point is available
    const strokeWidth =
      valuesCount === 1
        ? 6
        : typeof strokeWidthsArg === 'number'
        ? strokeWidthsArg
        : Array.isArray(strokeWidthsArg)
        ? (_: any, ix: number) => strokeWidthsArg[ix]
        : 2

    this.dataGrp
      .selectAll('path.line')
      .data(this.lineFunctions)
      .join('path')
      .attr('class', 'line')
      .attr('d', ([_, lineFn]) => <string>lineFn(this.data))
      .attr('stroke', (_, ix) => this.colors[ix])
      .attr('stroke-width', <any>strokeWidth)
  }

  protected drawRange() {
    this.rangePath.attr('d', createRangePathArea(this.data, this.scaleTimeX, this.scaleLinearY))
  }
}
