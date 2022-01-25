import { Platform } from '@angular/cdk/platform'
import { DOCUMENT } from '@angular/common'
import { AfterViewInit, Component, Inject, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core'
import { isDefined } from '@c19/commons'
import {
  area,
  EnterElement,
  line,
  scaleBand,
  ScaleBand,
  scaleLinear,
  ScaleLinear,
  scaleTime,
  ScaleTime,
  Selection,
} from 'd3'
import { addDays, differenceInDays, setHours, startOfDay } from 'date-fns'
import { Subject } from 'rxjs'
import { COLOR_DIAGRAM_TICK_LINE, COLOR_DIAGRAM_TICK_TEXT } from '../../shared/commons/colors.const'
import { D3SvgComponent } from '../../shared/components/d3-svg/d3-svg.component'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate } from '../../static-utils/date-utils'
import { calcDomainEnd, checkIntersection } from '../utils'

export interface HistogramEntry {
  date: Date
}

export interface NoDataBlock<T> {
  from: number
  to: number
  items: T[]
}

export interface Band {
  upper: number
  lower: number
}

export interface HistogramBandEntry extends HistogramEntry {
  band?: Band | null
}

export const dateKeyFn = (v: HistogramEntry) => v.date.getTime()

export function middleOfDay(date: Date) {
  return setHours(startOfDay(date), 12)
}

@Component({ template: '' })
export abstract class BaseHistogramComponent<T extends HistogramEntry> implements OnChanges, AfterViewInit, OnDestroy {
  @Input()
  withWeeklyValues = false

  @Input()
  withWeeklyXLabels = false

  @Input()
  xWeeklyLabelFormatter?: (d: Date) => string

  @Input()
  xWeeklySubLabelFormatter?: (d: Date) => string

  protected static instanceCounter = 0
  protected readonly instanceId = ++BaseHistogramComponent.instanceCounter

  protected static DATE_FMT = 'dd.MM'
  protected static DATE_FMT_FULL = 'dd.MM.yyyy'
  protected static ASSUMED_CHAR_WIDTH = 8 // font size 12
  protected static ASSUMED_SMALL_CHAR_WIDTH = (8 / 12) * 10 // font size 10

  set data(data: T[]) {
    this._data = data
    this.firstDate = this.withWeeklyValues ? addDays(data[0].date, -3) : data[0].date
    this.lastDate = this.withWeeklyValues ? addDays(data[data.length - 1].date, 3) : data[data.length - 1].date
    this.xCount = differenceInDays(this.lastDate, this.firstDate) + 1
  }

  get data() {
    return this._data
  }

  @Input()
  domainMin = 0

  @Input()
  noOffsetX: boolean

  @Input()
  domainMax?: number

  @Input()
  yLabelFormatter?: (v: number) => string

  @Input()
  yLabelsMaxLength?: number

  @ViewChild(D3SvgComponent)
  svg: D3SvgComponent

  firstDate: Date

  lastDate: Date

  protected abstract yMaxValue: number
  protected abstract yTickCount: number

  protected margin = { top: 0, right: 0, bottom: 0, left: 0 }
  protected bandWithX: number
  protected paddingX: number
  protected bandOffsetX: number
  protected scaleBandX: ScaleBand<Date>
  protected scaleTimeX: ScaleTime<number, number>
  protected scaleLinearY: ScaleLinear<number, number>
  protected dataGrp: Selection<SVGGElement, void, null, undefined>
  protected xAxisGrp: Selection<SVGGElement, void, null, undefined>
  protected xAxisLine: Selection<SVGLineElement, void, null, undefined>
  protected yAxisGrp: Selection<SVGGElement, void, null, undefined>
  protected noDataBlocks: NoDataBlock<T>[]
  protected xCount: number

  protected initialized = false
  protected readonly onDestroy = new Subject<void>()

  private _data: T[]
  private calculatedYLabelsMaxLength: number

  constructor(protected readonly platform: Platform, @Inject(DOCUMENT) protected readonly doc: Document) {}

  ngOnChanges(changes: SimpleChanges) {
    if (isDefined(this.data) && isDefined(this.yTickCount) && isDefined(this.domainMin)) {
      this.calculatedYLabelsMaxLength = this.calcYLabelsMaxLength()
    }
    if (this.initialized && this.svg.isVisible) {
      this.createScales()
      this.paint()
    }
  }

  ngAfterViewInit() {
    this.setupChart()
    // repaint$ completes on destroy, no need for takeUntil
    this.svg.repaint$.subscribe(() => {
      this.createScales()
      this.paint()
    })
    setTimeout(() => (this.initialized = true))
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  protected abstract paint(): void

  protected setupChart(fontSize = 12) {
    this.yAxisGrp = this.svg.svg
      .append('g')
      .attr('class', 'y-axis')
      .attr('text-anchor', 'end')
      .attr('font-size', fontSize)
      .attr('fill', COLOR_DIAGRAM_TICK_TEXT)

    this.dataGrp = this.svg.svg.append('g').attr('class', 'data')

    this.xAxisGrp = this.svg.svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('text-anchor', 'middle')
      .attr('font-size', fontSize)
    this.xAxisLine = this.svg.svg.append('line').attr('class', 'x-axis-base')
  }

  protected createScales() {
    this.createScalesX()
    this.createScaleLinearY()
  }

  protected drawStackedBars(barValuesFn: (v: T) => Array<number | null | undefined>, colors: readonly string[]) {
    const cleanedColors = colors.map((c) => (c.startsWith('url') ? c.replace(')', `${this.svg.idCounter})`) : c))
    this.dataGrp.attr(
      'fill',
      cleanedColors[0].startsWith('url') && cleanedColors.length > 1 ? cleanedColors[1] : cleanedColors[0],
    )

    const preCalcStackStart = (val: number | null | undefined, ix: number, arr: Array<number | null | undefined>) => ({
      val,
      start: arr.slice(0, ix + 1).reduce((u: number, i) => u + (i || 0), 0),
    })

    const translateOffset = this.withWeeklyValues
      ? this.bandOffsetX - (this.bandWithX * 3 + this.paddingX * 3)
      : this.bandOffsetX
    const width = this.withWeeklyValues ? this.bandWithX * 7 + this.paddingX * 6 : this.bandWithX

    this.dataGrp
      .selectAll('g')
      .data(this.data, <any>dateKeyFn)
      .join('g')
      .attr('transform', ({ date }) => `translate(${<number>this.scaleBandX(middleOfDay(date)) + translateOffset}, 0)`)
      .selectAll('rect')
      .data((v: T) => barValuesFn(v).map(preCalcStackStart))
      .join('rect')
      .attr('width', width)
      .attr('y', ({ start }) => <number>this.scaleLinearY(start))
      .attr('height', ({ val }) => <number>this.scaleLinearY(this.domainMin) - <number>this.scaleLinearY(val || 0))
      .attr('fill', (_, ix) =>
        ix === 0 ? (cleanedColors[ix].startsWith('url') ? cleanedColors[ix] : null) : cleanedColors[ix],
      )
  }

  protected drawNoDataBlocks(
    blocks: NoDataBlock<T>[] = this.noDataBlocks,
    className: string = 'no-data',
    fill: string = this.svg.noDataFill,
  ) {
    const range = this.scaleLinearY.range()
    this.dataGrp
      .selectAll(`rect.${className}`)
      .data(blocks)
      .join('rect')
      .attr('stroke', 'none')
      .attr('class', className)
      .attr('x', ({ items }) => <number>this.scaleTimeX(middleOfDay(items[0].date)) - this.bandWithX / 2)
      .attr(
        'width',
        ({ items }) =>
          <number>this.scaleTimeX(middleOfDay(items[items.length - 1].date)) -
          <number>this.scaleTimeX(middleOfDay(items[0].date)) +
          this.bandWithX,
      )
      .attr('y', range[1])
      .attr('height', () => range[0] - range[1])
      .attr('fill', fill)
      .attr('opacity', 0.5)
  }

  protected drawMinimalXAxis() {
    const labels = [this.firstDate, this.lastDate]

    this.xAxisGrp
      .selectAll('text')
      .data(labels)
      .join('text')
      .attr('text-anchor', (_, ix, arr) => (ix === 0 ? 'start' : ix === arr.length - 1 ? 'end' : 'middle'))
      .attr('dy', 12)
      .text((v: Date, ix, arr) => {
        const fmt =
          ix === 0 || ix === arr.length - 1 ? BaseHistogramComponent.DATE_FMT_FULL : BaseHistogramComponent.DATE_FMT
        return formatUtcDate(v, fmt)
      })
      .attr('transform', (v, ix, arr) => {
        const x =
          ix === 0
            ? this.margin.left
            : ix === arr.length - 1
            ? this.svg.width - this.margin.right
            : this.scaleTimeX(middleOfDay(v))
        const y = this.svg.height - this.margin.bottom
        return `translate(${x}, ${y})`
      })

    this.updateXAxisBaseLine()
  }

  protected drawFullXAxis(forWeeklyValues = false) {
    const range = this.scaleTimeX.range()

    const showLabelFilter: (v: T, ix: number, arr: T[]) => boolean =
      this.xCount > 56
        ? (v, ix, arr) => ix === 0 || ix === arr.length - 1 || v.date.getDate() === 1 // first of month
        : (v, ix, arr) => ix === 0 || ix === arr.length - 1 || v.date.getDay() === 1 // monday
    const tickItems = forWeeklyValues ? this.data : this.data.filter(showLabelFilter)
    // DATE_FMT.length = length of x-labels
    // or get the max length of weekly label or sub label
    const lw0 =
      this.withWeeklyXLabels && this.xWeeklyLabelFormatter && this.xWeeklySubLabelFormatter
        ? Math.max(
            this.xWeeklyLabelFormatter(new Date()).length * BaseHistogramComponent.ASSUMED_CHAR_WIDTH,
            this.xWeeklySubLabelFormatter(new Date()).length * BaseHistogramComponent.ASSUMED_SMALL_CHAR_WIDTH,
          )
        : BaseHistogramComponent.DATE_FMT.length * BaseHistogramComponent.ASSUMED_CHAR_WIDTH
    const lw = lw0 * 2

    // first & last label also contain the year (+ 2 * 5 Chars)
    const lwAddon = this.withWeeklyXLabels ? 0 : 2 * 5 * BaseHistogramComponent.ASSUMED_CHAR_WIDTH
    const spaceForMax = (range[1] - range[0] - lwAddon) / lw
    const everyNth = Math.max(1, Math.floor(tickItems.length / spaceForMax))

    const actualTickItems = tickItems
      .filter((v, ix, arr) => ix === 0 || ix === arr.length - 1 || ix % everyNth === 0)
      .map((v) => v.date)

    const axisGroups = this.xAxisGrp
      .selectAll('g')
      .data(actualTickItems, <any>((d: Date) => d.getTime()))
      .join((group) => {
        const g = group.append('g')
        g.append('line').attr('stroke', '#333333').attr('y2', 4)
        g.append('text')
          .attr('dy', 16)
          .attr('fill', '#333333')
          .text((v: Date, ix, arr) => {
            if (this.withWeeklyXLabels) {
              if (!isDefined(this.xWeeklyLabelFormatter)) {
                throw new Error('xWeeklyLabelFormatter fn was not provided via @Input()')
              }
              return this.xWeeklyLabelFormatter(v)
            }
            const fmt =
              ix === 0 || ix === arr.length - 1 ? BaseHistogramComponent.DATE_FMT_FULL : BaseHistogramComponent.DATE_FMT
            return formatUtcDate(v, fmt)
          })
        // add second line label
        if (this.withWeeklyXLabels) {
          g.append('text')
            .attr('dy', 28)
            .attr('fill', '#333333')
            .attr('font-size', 10)
            .text((v: Date, ix, arr) => {
              if (!isDefined(this.xWeeklySubLabelFormatter)) {
                throw new Error('xWeeklySubLabelFormatter fn was not provided via @Input()')
              }
              return this.xWeeklySubLabelFormatter(v)
            })
        }
        return g
      })
      .attr(
        'transform',
        (v: Date) => `translate(${this.scaleTimeX(middleOfDay(v))}, ${this.svg.height - this.margin.bottom})`,
      )
      .attr('opacity', null)

    if (lw0 <= this.bandWithX) {
      // Keep the first and the last tick labels also aligned center to the tick line
      axisGroups.select('text').attr('text-anchor', null).attr('dx', null)
    } else {
      // bar is smaller than the tick label -- align the first+last tick labels to the start/end of the x-axis
      axisGroups
        .filter((_, ix) => ix === 0)
        .selectAll('text')
        .attr('text-anchor', 'start')
        .attr('dx', () => (!this.noOffsetX ? -(this.bandWithX / 2) : null))

      axisGroups
        .filter((_, ix, arr) => ix === arr.length - 1)
        .selectAll('text')
        .attr('text-anchor', 'end')
        .attr('dx', () => (!this.noOffsetX ? this.bandWithX / 2 : null))
    }

    const tickNodes = <SVGGElement[]>axisGroups.nodes()
    if (tickNodes.length >= 3) {
      // [0]=first | [1]=2nd | [2]=3rd
      const first3Ticks = tickNodes.slice(0, 3).map((node) => node.getBoundingClientRect())
      // [0]=last | [1]=2nd last | [2]=3rd last
      const last3Ticks = tickNodes
        .slice(tickNodes.length - 3, tickNodes.length)
        .reverse()
        .map((node) => node.getBoundingClientRect())

      if (checkIntersection(first3Ticks[0], first3Ticks[1], 6)) {
        this.xAxisGrp.selectAll('g:nth-of-type(2)').attr('opacity', 0)
      }
      if (checkIntersection(first3Ticks[0], first3Ticks[2], 6)) {
        this.xAxisGrp.selectAll('g:nth-of-type(3)').attr('opacity', 0)
      }
      if (checkIntersection(last3Ticks[0], last3Ticks[1], 6)) {
        this.xAxisGrp.selectAll(`g:nth-of-type(${tickNodes.length - 1})`).attr('opacity', 0)
      }
      if (checkIntersection(last3Ticks[0], last3Ticks[2], 6)) {
        this.xAxisGrp.selectAll(`g:nth-of-type(${tickNodes.length - 2})`).attr('opacity', 0)
      }
    }
    this.updateXAxisBaseLine()
  }

  protected drawPreviewYAxis(noData = false) {
    const domain = this.scaleLinearY.domain()
    const linesData = [(domain[1] - domain[0]) / 2, domain[1]]
    const labelsData = [domain[1]]
    const idFn = (v: number) => v
    this.yAxisGrp
      .selectAll('line')
      .data(linesData, <any>idFn)
      .join('line')
      .attr('stroke', '#ddd')
      .attr('x', this.margin.left)
      .attr('x2', this.svg.width - this.margin.right)
      .attr('transform', (v) => `translate(0, ${<number>this.scaleLinearY(v)})`)

    this.yAxisGrp
      .selectAll('text')
      .data(labelsData, <any>idFn)
      .join('text')
      .attr('dy', this.margin.top - 4)
      .text((v) => (noData ? 'n/A' : (this.yLabelFormatter || adminFormatNum)(v)))
  }

  protected drawNoDataLabel(showOrHide: boolean, text: string) {
    this.svg.svg
      .selectAll('text.no-data-lbl')
      .data(showOrHide ? [true] : [])
      .join('text')
      .attr('class', 'no-data-lbl')
      .attr('y', <number>this.scaleLinearY(this.yMaxValue / 2))
      .attr('x', this.margin.left + (this.svg.width - this.margin.left - this.margin.right) / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('fill', COLOR_DIAGRAM_TICK_TEXT)
      .attr('dy', -12)
      .text(text)
  }

  protected drawFullYAxis() {
    const yAxisTicks = this.getYAxisTicks(this.scaleLinearY)
    const idFn = (v: number) => v

    this.yAxisGrp
      .selectAll('g')
      .data(yAxisTicks, <any>idFn)
      .join(this.createFullYAxisTick, <any>this.updateFullYAxisTick)
  }

  protected updateFullYAxisTick = (g: Selection<SVGGElement, number, SVGGElement, void>) => {
    g.attr('transform', (v) => `translate(0, ${this.scaleLinearY(v)})`)
    g.select('line')
      .attr('x1', this.margin.left - 2)
      .attr('x2', this.svg.width - this.margin.right)
    // .attr('opacity', (_, ix) => (ix === 0 ? '0' : null))

    g.select('text')
      .attr('dx', this.margin.left - 4)
      .text((v) => (this.yLabelFormatter || adminFormatNum)(v))
    return g
  }
  protected createFullYAxisTick = (group: Selection<EnterElement, number, SVGGElement, void>) => {
    const g = group.append('g')
    g.append('line').attr('stroke', COLOR_DIAGRAM_TICK_LINE)
    g.append('text').attr('dy', 4)
    return this.updateFullYAxisTick(g)
  }

  protected updateXAxisBaseLine() {
    this.xAxisLine
      .attr('x1', this.margin.left)
      .attr('x2', this.svg.width - this.margin.right)
      .attr('transform', `translate(0, ${this.svg.height - this.margin.bottom})`)
  }

  protected updateValueDomain(el: Selection<SVGRectElement, void, null, undefined>) {
    el.attr('x', this.margin.left)
      .attr('y', this.margin.top)
      .attr('width', this.svg.width - this.margin.left - this.margin.right)
      .attr('height', this.svg.height - this.margin.top - this.margin.bottom)
  }

  protected createLine(valueFn: (v: T) => number | null | undefined) {
    return line<T>()
      .x(({ date }) => <number>this.scaleTimeX(middleOfDay(date)))
      .y((entry) => <number>this.scaleLinearY(valueFn(entry) || 0))
      .defined((entry) => isDefined(valueFn(entry)))
  }

  protected createArea(valueFn: (v: T) => number | null | undefined, y0: number) {
    return area<T>()
      .x(({ date }) => <number>this.scaleTimeX(middleOfDay(date)))
      .y0(y0)
      .y1((entry) => <number>this.scaleLinearY(valueFn(entry) || 0))
      .defined((entry) => isDefined(valueFn(entry)))
  }

  protected getYLabelsMaxLength(): number {
    return this.yLabelsMaxLength || this.calculatedYLabelsMaxLength
  }

  protected calcNoDataBlocks(skipValueTestFn: (v: T) => boolean): NoDataBlock<T>[] {
    return this.data.reduce((u, item, ix) => {
      if (skipValueTestFn(item)) {
        // skip item if it matches the function
        return u
      }
      const before = u[u.length - 1]
      if (before && before.to === ix - 1) {
        before.to = ix
        before.items.push(item)
      } else {
        u.push({ from: ix, to: ix, items: [item] })
      }
      return u
    }, <NoDataBlock<T>[]>[])
  }

  private calcYLabelsMaxLength(): number {
    const scale = this.createScaleLinearYDomain()
    return Math.max(
      ...this.getYAxisTicks(scale)
        .map((v) => (this.yLabelFormatter || adminFormatNum)(v))
        .map((v) => v.length),
    )
  }

  private createScalesX() {
    const width = this.svg.width - this.margin.right

    const d0 = this.firstDate

    this.scaleBandX = scaleBand<Date>()
      .domain(new Array(this.xCount).fill(0).map((_, ix) => middleOfDay(addDays(d0, ix))))
      .range([this.margin.left, width])

    const bandwidth = this.scaleBandX.bandwidth()

    const bandwidthForPadding = this.withWeeklyValues ? bandwidth * 7 : bandwidth
    this.paddingX = bandwidthForPadding > 6 ? 2 : bandwidthForPadding > 4 ? 1 : 0
    this.bandOffsetX = this.paddingX / 2
    this.bandWithX = bandwidth - this.paddingX

    const offset = this.noOffsetX ? 0 : bandwidth / 2
    this.scaleTimeX = scaleTime()
      .domain([middleOfDay(this.firstDate), middleOfDay(this.lastDate)])
      .range([this.margin.left + offset, width - offset])
  }

  private createScaleLinearY() {
    this.scaleLinearY = this.createScaleLinearYDomain().range([this.svg.height - this.margin.bottom, this.margin.top])
  }

  /** create basic scaleLinear for Y-Axis without range (domain only) */
  private createScaleLinearYDomain() {
    const domainMax = this.domainMax ? this.domainMax : calcDomainEnd(this.yMaxValue, this.yTickCount + 1)
    return scaleLinear().domain([this.domainMin, domainMax]) // .nice(this.yTickCount)
  }

  protected getYAxisTicks(yScale: ScaleLinear<number, number>): number[] {
    return yScale.ticks(this.yTickCount)
    // const tickRange = yScale.domain()[1] / (this.yTickCount + 1)
    // return new Array(this.yTickCount + 1).fill(0).map((_, ix) => (ix + 1) * tickRange)
  }
}
