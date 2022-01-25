import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { isDefined } from '@c19/commons'
import { Line, Selection } from 'd3'
import { COLORS_HISTOGRAM_DEFAULT } from '../../../shared/commons/colors.const'
import { HistogramEntry } from '../base-histogram.component'
import { BaseHistogramPreviewComponent } from './base-histogram-preview.component'

export interface HistogramPreviewEntry extends HistogramEntry {
  barValues: Array<number | null>
  lineValues: Array<number | null>
}

const sum = (u: number, i: number | null | undefined): number => u + (i || 0)

@Component({
  selector: 'bag-histogram-preview',
  templateUrl: './histogram-preview.component.html',
  styleUrls: ['./histogram-preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramPreviewComponent<T extends HistogramPreviewEntry> extends BaseHistogramPreviewComponent<T> {
  @Input()
  override set data(data: T[]) {
    super.data = data
    this.yMaxValue =
      Math.max(
        ...data.reduce((u, i) => [...u, i.barValues.reduce(sum, 0), ...i.lineValues.map((v) => v || 0)], <number[]>[]),
      ) || 1
    this.lineFunctions = new Array(this.data.reduce((u, i) => Math.max(u, i.lineValues.length), 0))
      .fill(0)
      .map((_, ix) => [ix, this.createLine((v) => v.lineValues[ix])])

    this.noDataBlocks = this.calcNoDataBlocks((v) => v.barValues.some(isDefined))
  }

  override get data() {
    return super.data
  }

  @Input()
  barColors: string[] = COLORS_HISTOGRAM_DEFAULT

  @Input()
  lineColors: string[] = ['#183458']

  @Input()
  lineThickness = 2

  @Input()
  barOpacity = 0.8

  protected yMaxValue: number

  protected lineFunctions: Array<[number, Line<T>]>
  protected linesGroup: Selection<SVGGElement, void, null, void>

  protected override setupChart() {
    super.setupChart()
    this.dataGrp.attr('shape-rendering', 'crispEdges').attr('opacity', this.barOpacity)

    this.linesGroup = this.svg.svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-width', this.lineThickness)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
  }

  protected paint() {
    this.drawNoDataBlocks()
    this.drawStackedBars((t: T) => t.barValues, this.barColors)
    this.drawMinimalXAxis()
    this.drawPreviewYAxis()
    this.drawLines()
  }

  protected drawLines() {
    this.linesGroup
      .selectAll('path')
      .data(this.lineFunctions)
      .join('path')
      .attr('d', ([, lineFn]) => <string>lineFn(this.data))
      .attr('stroke', ([ix]) => this.lineColors[ix])
  }
}
