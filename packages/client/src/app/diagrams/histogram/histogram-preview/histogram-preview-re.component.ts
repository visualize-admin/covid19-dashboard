import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { isDefined } from '@c19/commons'
import { Line, Selection } from 'd3'
import { COLOR_RANGE_1, COLOR_RANGE_2, COLOR_RANGE_3 } from '../../../shared/commons/colors.const'
import { adminFormatNum } from '../../../static-utils/admin-format-num.function'
import { createRangePathArea, defineSteppedGradient } from '../../utils'
import { HistogramBandEntry, middleOfDay } from '../base-histogram.component'
import { BaseHistogramPreviewComponent } from './base-histogram-preview.component'

export interface HistogramPreviewReEntry extends HistogramBandEntry {
  value: number | null
}

@Component({
  selector: 'bag-histogram-preview-re',
  templateUrl: './histogram-preview.component.html',
  styleUrls: ['./histogram-preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramPreviewReComponent<T extends HistogramPreviewReEntry> extends BaseHistogramPreviewComponent<T> {
  @Input()
  override set data(data: T[]) {
    super.data = data
    this.yMaxValue = Math.max(1.5, ...data.reduce((u, i) => [...u, i.value || 0], <number[]>[]))
    this.noDataBlocks = this.calcNoDataBlocks((v) => isDefined(v.value))
  }

  override get data() {
    return super.data
  }

  protected yMaxValue: number
  protected override yTickCount = 1
  protected override margin = { top: 20, right: 0, bottom: 20, left: 0 }
  protected readonly lineFn: Line<T> = this.createLine((v) => v.value)
  protected pathEl: Selection<SVGPathElement, void, null, void>
  protected extraLabel: Selection<SVGTextElement, void, null, void>
  protected singleValuePoint: Selection<SVGCircleElement, void, null, void>
  protected rangePath: Selection<SVGPathElement, void, null, undefined>
  protected gradient: Selection<SVGLinearGradientElement, void, null, undefined>
  protected readonly ranges = [0.8, 1]
  protected readonly rangeColors = [COLOR_RANGE_1, COLOR_RANGE_2, COLOR_RANGE_3]
  private readonly gradientId = `histogram-preview-re-gradient-${this.instanceId}`

  protected override setupChart() {
    super.setupChart()

    this.gradient = this.svg.svg
      .append('linearGradient')
      .attr('id', this.gradientId)
      .attr('gradientUnits', 'userSpaceOnUse')

    this.rangePath = this.dataGrp.append('path').attr('class', 'range').attr('fill', '#ccc').attr('opacity', 0.5)

    this.pathEl = this.dataGrp
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', `url(#${this.gradientId})`)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')

    this.singleValuePoint = this.svg.svg.append('circle').attr('r', 3).attr('fill', 'none').attr('stroke', 'none')

    this.extraLabel = this.svg.svg
      .append('text')
      .attr('font-size', 12)
      .attr('style', 'text-shadow: 2px 0 1px white, -2px 0 1px white, 0 2px 1px white, 0 -2px 1px white;')
      .attr('dy', -4)
      .text(1)
  }

  protected paint() {
    this.drawMinimalXAxis()
    this.drawPreviewReYAxis()
    this.drawRange()
    this.defineGradient(this.ranges, this.rangeColors)
    this.drawLine()
    this.extraLabel.attr('transform', `translate(0, ${this.scaleLinearY(1)})`)
  }

  protected drawLine() {
    const actualValues = this.data.filter((v) => isDefined(v.value))

    if (actualValues.length === 1) {
      const entry = actualValues[0]
      this.singleValuePoint
        .attr('cx', <number>this.scaleTimeX(middleOfDay(entry.date)))
        .attr('cy', <number>this.scaleLinearY(<number>entry.value))
        .attr('fill', () => {
          const v = <number>entry.value
          if (v < 0.8) {
            return this.rangeColors[0]
          } else if (v < 1) {
            return this.rangeColors[1]
          } else {
            return this.rangeColors[2]
          }
        })
    } else {
      this.singleValuePoint.attr('fill', 'none')
    }

    this.pathEl.attr('d', <string>this.lineFn(this.data))
  }

  protected drawRange() {
    this.rangePath.attr('d', createRangePathArea(this.data, this.scaleTimeX, this.scaleLinearY))
  }

  protected drawPreviewReYAxis() {
    const yEnd = this.scaleLinearY.domain()[1]
    const labelsData = yEnd === 1 ? [0.5, 1] : [1, yEnd]
    const idFn = (v: number) => v

    this.yAxisGrp
      .selectAll('g')
      .data(labelsData, <any>idFn)
      .join((group) => {
        const g = group.append('g')
        g.append('line')
        g.append('text')
          .attr('dy', -4)
          .attr('fill', (v) => (v === 1 ? '#000' : null))
          .text((v) => (v === yEnd || v === 1 ? (this.yLabelFormatter || adminFormatNum)(v) : null))
        return g
      })
      .attr('transform', (y) => `translate(0, ${this.scaleLinearY(y)})`)
      .select('line')
      .attr('x2', this.svg.width - this.margin.right)
      .attr('stroke', (v: number) => (v === 1 ? '#000' : '#e5e5e5'))
  }

  protected defineGradient(ranges: number[], colors: string[]) {
    defineSteppedGradient(this.gradient, this.scaleLinearY, ranges, colors, this.margin, this.svg)
  }
}
