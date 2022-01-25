import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { Area, Line } from 'd3'
import { HistogramAreaEntry } from '../histogram-area/histogram-area.component'
import { BaseHistogramPreviewComponent } from './base-histogram-preview.component'

@Component({
  selector: 'bag-histogram-preview-area',
  templateUrl: './histogram-preview.component.html',
  styleUrls: ['./histogram-preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramPreviewAreaComponent<T extends HistogramAreaEntry> extends BaseHistogramPreviewComponent<T> {
  @Input()
  override set data(data: T[]) {
    super.data = data
    this.yMaxValue = Math.max(...data.reduce((u, i) => [...u, ...i.values.map((v) => v || 0), 0], <number[]>[]))
  }

  override get data() {
    return super.data
  }

  @Input()
  colors: string[]

  @Input()
  lineColors: string[]

  @Input()
  showLines = true

  @Input()
  areaOpacities: number | number[]

  @Input()
  strokeWidths: number | number[]

  protected yMaxValue: number

  protected areaFunctions: Array<Area<T>>
  protected lineFunctions: Array<Line<T>>

  protected override setupChart() {
    super.setupChart()

    this.dataGrp
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .raise()
  }

  protected paint(): void {
    this.drawMinimalXAxis()
    this.drawPreviewYAxis()
    this.drawAreas()
    if (this.showLines) {
      this.drawLines()
    }
  }

  protected drawAreas() {
    this.areaFunctions = this.createAreaFunctions()

    const data = this.areaFunctions.map((areaFn, ix) => ({
      area: <string>areaFn(this.data),
      color:
        this.colors[ix] && this.colors[ix].startsWith('url')
          ? this.colors[ix].replace(')', `${this.svg.idCounter})`)
          : this.colors[ix],
      opacity: Array.isArray(this.areaOpacities) ? this.areaOpacities[ix] : this.areaOpacities ?? 1,
    }))

    this.dataGrp
      .selectAll('path.area')
      .data(data)
      .join('path')
      .attr('class', 'area')
      .attr('d', ({ area }) => area)
      .attr('fill', ({ color }) => color)
      .attr('opacity', ({ opacity }) => opacity)
      .lower()
  }

  protected drawLines() {
    this.lineFunctions = this.createLineFunctions()

    const data = this.lineFunctions.map((lineFn, ix) => ({
      line: <string>lineFn(this.data),
      color: this.lineColors[ix],
      strokeWidths: Array.isArray(this.strokeWidths) ? this.strokeWidths[ix] : this.strokeWidths ?? 4,
    }))

    this.dataGrp
      .selectAll('path.line')
      .data(data)
      .join('path')
      .attr('class', 'line')
      .attr('d', ({ line }) => line)
      .attr('stroke', ({ color }) => color)
      .attr('stroke-width', ({ strokeWidths }) => strokeWidths)
  }

  protected createAreaFunctions(): Array<Area<T>> {
    return new Array(this.data.reduce((u, i) => Math.max(u, i.values.length), 0))
      .fill(0)
      .map((_, ix) => this.createArea((v) => v.values[ix], this.svg.height - this.margin.top))
  }

  protected createLineFunctions(): Array<Line<T>> {
    return new Array(this.data.reduce((u, i) => Math.max(u, i.values.length), 0))
      .fill(0)
      .map((_, ix) => this.createLine((v) => v.values[ix]))
  }
}
