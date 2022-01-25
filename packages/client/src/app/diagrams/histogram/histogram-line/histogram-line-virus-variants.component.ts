import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { isDefined } from '@c19/commons'
import { Band, middleOfDay } from '../base-histogram.component'
import { HistogramLineComponent, HistogramLineEntry } from './histogram-line.component'

export interface HistogramLineVirusVariantsEntry extends HistogramLineEntry {
  /**
   * either with ref: [dailyValue, mean7Days, refMean7d] or without [dailyValue, mean7Days]
   */
  values: [number | null, number | null, number | null] | [number | null, number | null]
  band: Band | null
}

@Component({
  selector: 'bag-histogram-line-virus-variants',
  templateUrl: './histogram-line.component.html',
  styleUrls: ['./histogram-line.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramLineVirusVariantsComponent<
  T extends HistogramLineVirusVariantsEntry,
> extends HistogramLineComponent<T> {
  @Input()
  override set data(data: T[]) {
    super.data = data
    this.yMaxValue = Math.max(
      ...data.reduce((u, i) => [...u, ...i.values.map((v) => v || 0), ...(i.band ? [i.band.upper] : [])], [0]),
    )

    this.lineFunctions = new Array(this.data.reduce((u, i) => Math.max(u, i.values.length), 0))
      .fill(0)
      .map((_, ix) => this.createLine((v) => v.values[ix]))
  }

  override get data() {
    return super.data
  }

  @Input()
  override set colors(value: string[]) {
    this._colors = value
  }

  override get colors() {
    return this._colors
  }

  readonly opacityDashed = [1, 0.6, 0.6]
  override readonly strokeWidths = [1, 4, 2]
  readonly strokeWidthsDashed = [1, 3, 1]
  readonly strokeDash = ['1 5', '1 9', '1 6']
  override readonly spanGaps = undefined
  override readonly disableNoDataBlocks = true

  protected override drawLines() {
    // draw 2 lines per value
    const data = this.lineFunctions
      .map((lineFn, ix) => [
        // 1st: dashed line without gaps for missing values
        {
          line: <string>lineFn(this.data.filter((e) => isDefined(e.values[ix]))),
          color: this.colors[ix],
          opacity: this.opacityDashed[ix],
          strokeWidths: this.strokeWidthsDashed[ix],
          strokeDashArray: this.strokeDash[ix],
        },
        // 2nd: solid line with gaps for missing values
        {
          line: <string>lineFn(this.data),
          color: this.colors[ix],
          opacity: 1,
          strokeWidths: this.strokeWidths[ix],
          strokeDashArray: null,
        },
      ])
      .reduce((u, d) => [...u, ...d], [])

    // draw daily points
    this.dataGrp
      .selectAll('circle.daily-value')
      .data(this.data)
      .join('circle')
      .attr('class', 'daily-value')
      .attr('r', 2)
      .attr('fill', this.colors[0])
      .attr('cx', ({ date }) => <number>this.scaleTimeX(middleOfDay(date)))
      .attr('cy', ({ values }) => (isDefined(values[0]) ? <number>this.scaleLinearY(values[0]) : null))
      .attr('opacity', ({ values }) => (isDefined(values[0]) ? null : 0))

    // draw lines
    this.dataGrp
      .selectAll('path.line')
      .data(data)
      .join('path')
      .attr('class', 'line')
      .attr('d', ({ line }) => line)
      .attr('stroke', ({ color }) => color)
      .attr('opacity', ({ opacity }) => (opacity === 1 ? null : opacity))
      .attr('stroke-width', ({ strokeWidths }) => strokeWidths)
      .attr('stroke-dasharray', ({ strokeDashArray }) => strokeDashArray)
  }

  protected override mapToEventAndTooltipData([x, item]: [number, T]): [DOMPoint, T] {
    const range = this.scaleLinearY.range()

    // custom order. the tooltip should be positioned on the mean value (do jump less)
    const [daily, mean, ref] = item.values
    const definedVal = [mean, daily, ref].find(isDefined)

    const y =
      this.focusPosYCenter || !isDefined(definedVal) ? (range[0] - range[1]) / 2 : <number>this.scaleLinearY(definedVal)

    const point = this.svg.svgEl.createSVGPoint()
    point.x = x
    point.y = y
    const source: DOMPoint = point.matrixTransform(<DOMMatrixInit>this.svg.svgEl.getScreenCTM())
    return [source, item]
  }
}
