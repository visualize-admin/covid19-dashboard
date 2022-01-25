import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { isDefined } from '@c19/commons'
import { EnterElement, Selection } from 'd3'
import { differenceInDays, isAfter } from 'date-fns'
import {
  COLOR_DIAGRAM_TICK_LINE,
  COLOR_DIAGRAM_TICK_TEXT,
  COLOR_HISTOGRAM_MENU_SELECTED,
  COLOR_HISTOGRAM_MENU_TOTAL,
} from '../../../shared/commons/colors.const'
import { adminFormatNum } from '../../../static-utils/admin-format-num.function'
import { BaseHistogramComponent, dateKeyFn, HistogramEntry, middleOfDay } from '../base-histogram.component'

const COLORS = {
  RECT: COLOR_HISTOGRAM_MENU_TOTAL,
  RECT_SELECTED: COLOR_HISTOGRAM_MENU_SELECTED,
  SELECTION_BG: 'rgba(66,139,211,.1)',
} as const

export interface HistogramMenuEntry extends HistogramEntry {
  value: number | null
}

@Component({
  selector: 'bag-histogram-menu',
  templateUrl: './histogram-menu.component.html',
  styleUrls: ['./histogram-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramMenuComponent<T extends HistogramMenuEntry> extends BaseHistogramComponent<T> {
  @Input()
  override set data(data: T[]) {
    super.data = data
    this.yMaxValue = Math.max(...data.reduce((u, i) => [...u, i.value || 0], <number[]>[]))
    this.noDataBlocks = this.calcNoDataBlocks((v) => isDefined(v.value))
  }

  override get data() {
    return super.data
  }

  @Input()
  set selectionStartDate(date: Date) {
    this._selectionStartDate = date
    if (this.initialized && this.svg.isVisible) {
      this.drawSelection()
    }
  }

  get selectionStartDate(): Date {
    return this._selectionStartDate || new Date(0)
  }

  protected yMaxValue: number

  protected yTickCount = 1

  protected selectionRect: Selection<SVGRectElement, void, null, void>

  protected override margin = { top: 16, right: 0, bottom: 16, left: 0 }

  private _selectionStartDate?: Date

  protected override setupChart() {
    this.selectionRect = this.svg.svg
      .append('rect')
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', COLORS.SELECTION_BG)
    super.setupChart()
    this.yAxisGrp.attr('font-size', 10).attr('text-anchor', 'start')
    this.dataGrp.attr('fill', COLORS.RECT).attr('shape-rendering', 'crispEdges')
    this.xAxisGrp.attr('fill', COLOR_DIAGRAM_TICK_TEXT).attr('font-size', 10)
    this.xAxisLine.attr('stroke', COLOR_DIAGRAM_TICK_LINE)
  }

  protected paint() {
    this.drawNoDataBlocks()
    this.drawBars()
    this.drawMinimalXAxis()
    this.drawMenuYAxis()
    this.drawSelection()
  }

  /**
   * custom implementation to save many unnecessary group dom nodes (like 4 * for every day since 24.02.2020)
   */
  protected drawBars() {
    this.dataGrp
      .selectAll('rect:not(.no-data)')
      .data(this.data, <any>dateKeyFn)
      .join(this.createBarRect, <any>this.updateBarRect)
  }

  protected drawMenuYAxis() {
    const labelsData = [this.scaleLinearY.domain()[1]]
    const idFn = (v: number) => v
    this.yAxisGrp
      .selectAll('g')
      .data(labelsData, <any>idFn)
      .join((group) => {
        const g = group.append('g')
        g.append('line').attr('stroke', '#e5e5e5').attr('x2', 8)
        g.append('text')
          .attr('dy', -4)
          .text((v) => (this.yLabelFormatter || adminFormatNum)(v))
        g.attr('transform', `translate(0, ${this.margin.top})`)
        return g
      })
  }

  protected drawSelection() {
    const dateStart = middleOfDay(this.selectionStartDate)
    const isValidStartDate = dateStart && differenceInDays(this.selectionStartDate, this.firstDate) >= 0

    this.dataGrp
      .selectAll<SVGGElement, T>('rect:not(.no-data)')
      .attr('fill', (val) => (isAfter(val.date, dateStart) ? COLORS.RECT_SELECTED : null))

    const x = isValidStartDate ? <number>this.scaleTimeX(dateStart) - this.bandWithX / 2 : 0
    this.selectionRect
      .attr('y', this.margin.top)
      .attr('height', this.svg.height - this.margin.top - this.margin.bottom)
      .attr('x', x)
      .attr('width', isValidStartDate ? this.svg.width - x - this.margin.right : 0)
  }

  private readonly createBarRect = (group: Selection<EnterElement, T, SVGGElement, void>) => {
    return this.updateBarRect(group.append('rect'))
  }

  private readonly updateBarRect = (rect: Selection<SVGRectElement, T, SVGGElement, void>) => {
    return rect
      .attr('x', ({ date }) => <number>this.scaleBandX(middleOfDay(date)) + this.bandOffsetX)
      .attr('width', this.bandWithX)
      .attr('y', ({ value }) => <number>this.scaleLinearY(value || 0))
      .attr('height', ({ value }) => <number>this.scaleLinearY(this.domainMin) - <number>this.scaleLinearY(value || 0))
  }
}
