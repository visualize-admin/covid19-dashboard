import { Platform } from '@angular/cdk/platform'
import { DOCUMENT } from '@angular/common'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { isDefined } from '@c19/commons'
import { EnterElement, scaleBand, ScaleBand, scaleLinear, ScaleLinear, Selection } from 'd3'
import { Subject } from 'rxjs'
import { COLOR_DIAGRAM_TICK_LINE, COLOR_DIAGRAM_TICK_TEXT } from '../../shared/commons/colors.const'
import { D3SvgComponent } from '../../shared/components/d3-svg/d3-svg.component'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { calcDomainEnd, checkIntersection, hexToRgb, initMouseListenerOnValueDomain, invert, rgbToHex } from '../utils'

export interface ColumnChartEntry {
  id: string
  values: [number | null, number | null]
}

export type ColumnChartDirection = 'horizontal' | 'vertical'

export interface ColumnChartElFocusEvent<T extends ColumnChartEntry = ColumnChartEntry> {
  source: DOMPoint
  data: T
  direction: ColumnChartDirection
}

type FocusedElValues<T> = [DOMPoint, T, Selection<SVGGElement, T, SVGGElement, void>]

const TICK_COUNT = 4
const ASSUMED_CHAR_WIDTH = 8
const FONT_SIZE = 12
const VERT_BAND_SIZE = 6
const VERT_BAND_PADDING = 6
const VERT_INNER_PADDING = 1

@Component({
  selector: 'bag-column-chart',
  templateUrl: './column-chart.component.html',
  styleUrls: ['./column-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnChartComponent<T extends ColumnChartEntry> implements OnChanges, AfterViewInit, OnDestroy {
  @Input()
  data: T[]

  @Input()
  set colors(colors: [string, string]) {
    this._colors = colors
    this.hoverColors = colors
      .map((c) => <[number, number, number]>hexToRgb(c).map((v) => Math.round(v * 0.85)))
      .map(rgbToHex)
  }

  get colors(): [string, string] {
    return this._colors
  }

  @Input()
  refValues?: [number | null, number | null]

  @Input()
  refColors?: [string, string]

  hoverColors: string[]

  @Input()
  direction: ColumnChartDirection = 'horizontal'

  @Input()
  rotateXAxisLabels?: boolean

  @Input()
  xLabelFormatter?: (v: string) => string

  @Output()
  readonly elFocus = new EventEmitter<ColumnChartElFocusEvent<T>>()

  @Output()
  readonly elBlur = new EventEmitter<ColumnChartElFocusEvent<T>>()

  @Output()
  readonly diagramLeave = new EventEmitter<void>()

  get isHorizontal(): boolean {
    return this.direction === 'horizontal'
  }

  get maxHeight(): string | null {
    return this.isHorizontal
      ? null
      : `${this.data.length * (VERT_BAND_SIZE * 2 + VERT_INNER_PADDING + VERT_BAND_PADDING) + 28}px`
  }

  get minHeight(): string | null {
    return this.isHorizontal ? '312px' : this.maxHeight
  }

  get marginBottom(): string {
    if (this.rotateXAxisLabels) {
      return `${this.bandAxisLabelsMaxLength * ASSUMED_CHAR_WIDTH * 0.8 - this.margin.bottom}px`
    } else {
      return '0px'
    }
  }

  @ViewChild(D3SvgComponent)
  svg: D3SvgComponent

  protected scaleBand: ScaleBand<string>
  protected scaleBandInvert: (val: number) => string | undefined
  protected scaleLinear: ScaleLinear<number, number>
  protected dataGrp: Selection<SVGGElement, void, null, undefined>
  protected refGrp: Selection<SVGGElement, void, null, undefined>
  protected bandAxisGrp: Selection<SVGGElement, void, null, undefined>
  protected linearAxisGrp: Selection<SVGGElement, void, null, undefined>
  protected focusEl: Selection<SVGLineElement, void, null, undefined>
  protected maxValue: number
  protected valueDomainRect: Selection<SVGRectElement, void, null, undefined>
  protected margin = {
    top: 20,
    right: 0,
    bottom: 20,
    left: 0,
  }
  protected initialized = false
  protected readonly onDestroy = new Subject<void>()
  private _colors: [string, string]
  private linearAxisLabelsMaxLength: number
  private bandAxisLabelsMaxLength: number

  constructor(protected readonly platform: Platform, @Inject(DOCUMENT) protected readonly doc: Document) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.data) {
      const definedValues = this.data
        .reduce<(number | null)[]>((u, i) => [...u, ...i.values], this.refValues || [])
        .filter(isDefined)
      this.maxValue = definedValues.length ? Math.max(...definedValues) : 1

      this.linearAxisLabelsMaxLength = this.calcValueLabelsMaxLength()
      this.bandAxisLabelsMaxLength = Math.max(...this.data.map((e) => e.id.length))
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
    if (this.platform.isBrowser) {
      initMouseListenerOnValueDomain(
        this.onDestroy,
        this.doc,
        this.svg.svgEl,
        this.valueDomainRect.nodes()[0],
        this.mapSvgPointToDomainData.bind(this),
        (a, b) => !!a && !!b && a[0] === b[0],
        this.mapToEventAndTooltipData.bind(this),
        this.setElIntoFocus.bind(this),
        this.setElOutFocus.bind(this),
        this.focusLost.bind(this),
      )
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  protected setupChart() {
    this.linearAxisGrp = this.svg.svg
      .append('g')
      .attr('class', 'linear-axis')
      .attr('font-size', FONT_SIZE)
      .attr('dominant-baseline', 'central')
      .attr('fill', COLOR_DIAGRAM_TICK_TEXT)

    this.refGrp = this.svg.svg
      .append('g')
      .attr('class', 'ref-values')
      .attr('stoke-width', 1)
      .attr('font-size', FONT_SIZE)

    this.dataGrp = this.svg.svg.append('g').attr('class', 'data')

    this.bandAxisGrp = this.svg.svg
      .append('g')
      .attr('class', 'band-axis')
      .attr('dominant-baseline', 'central')
      .attr('font-size', FONT_SIZE)
      .attr('fill', '#333333')

    this.focusEl = this.svg.svg
      .append('line')
      .attr('stroke-dasharray', '6 2')
      .attr('stroke-width', 1)
      .attr('stroke', this.hoverColors[this.colors.length - 1])

    this.valueDomainRect = this.svg.svg.append('rect').attr('fill', 'transparent').attr('stroke', 'none')
  }

  protected paint() {
    const refTextRects = this.drawRefLines()
    this.drawLinearAxis(refTextRects)
    this.drawBandLegend()

    if (this.isHorizontal) {
      this.drawColumns()
    } else {
      this.drawBars()
    }

    this.valueDomainRect
      .attr('x', this.margin.left)
      .attr('y', this.margin.top)
      .attr('width', this.svg.width - this.margin.left - this.margin.right)
      .attr('height', this.svg.height - this.margin.top - this.margin.bottom)
  }

  protected drawBandLegend() {
    this.bandAxisGrp.attr('text-anchor', 'middle')

    const line = this.bandAxisGrp
      .selectAll('line')
      .data([0])
      .join('line')
      .attr('stroke-width', 1)
      .attr('stroke', '#333')

    const labels = this.bandAxisGrp
      .selectAll('text')
      .data(this.scaleBand.domain())
      .join('text')
      .text((v) => (this.xLabelFormatter ? this.xLabelFormatter(v) : v))

    if (this.isHorizontal) {
      this.bandAxisGrp.attr('transform', `translate(0, ${this.svg.height - this.margin.bottom})`)

      line
        .attr('y1', null)
        .attr('y2', null)
        .attr('x1', this.margin.left)
        .attr('x2', this.svg.width - this.margin.right)

      // labels (rotated)
      if (this.rotateXAxisLabels) {
        labels
          .attr('text-anchor', 'end')
          .attr('dx', '-.6em')
          .attr('dy', '.12em')
          .attr(
            'transform',
            (v) => `translate(${<number>this.scaleBand(v) + this.scaleBand.bandwidth() / 2}, 0) rotate(-65)`,
          )
      } else {
        labels
          .attr('dy', this.margin.bottom / 2)
          .attr('dx', (v) => <number>this.scaleBand(v) + this.scaleBand.bandwidth() / 2)
          .attr('text-anchor', null)
          .attr('transform', null)
      }
    } else {
      this.bandAxisGrp.attr('transform', `translate(${this.margin.left}, 0)`)

      line
        .attr('y1', this.margin.top)
        .attr('y2', this.svg.height - this.margin.bottom)
        .attr('x1', null)
        .attr('x2', null)

      labels
        .attr('dy', (v) => <number>this.scaleBand(v) + this.scaleBand.bandwidth() / 2)
        .attr('dx', this.margin.left / -2)
        .attr('text-anchor', null)
        .attr('transform', null)
    }
  }

  protected drawLinearAxis(refRects: DOMRect[]) {
    const updateFn = this.isHorizontal ? this.updateLinearAxisOnY : this.updateLinearAxisOnX

    const createFn = (group: Selection<EnterElement, number, SVGGElement, void>) => {
      const g = group.append('g')
      g.append('line')
      g.append('text')
      return updateFn(g)
    }

    const grps = this.linearAxisGrp
      .attr('text-anchor', this.isHorizontal ? 'end' : 'middle')
      .selectAll('g')
      .data(this.getLinearAxisTicks(this.scaleLinear))
      .join(createFn, <any>updateFn)

    const textRects = grps
      .select<SVGTextElement>('text')
      .nodes()
      .map((node) => node.getBoundingClientRect())

    // check for intersection between axis tick labels and the ref line labels
    //  if intersecting: remove linear axis tick label
    const intersectingIx: number[] = textRects
      .map((tickRect, ix) => (refRects.some((refRect) => checkIntersection(refRect, tickRect, 4)) ? ix : null))
      .filter(isDefined)

    // check intersection of 2nd last with last (which can happen since the last ist not center but right aligned
    if (
      textRects.length > 1 &&
      checkIntersection(textRects[textRects.length - 1], textRects[textRects.length - 2], 4)
    ) {
      intersectingIx.push(textRects.length - 2)
    }

    grps.select<SVGTextElement>('text').attr('opacity', (_, ix) => (intersectingIx.includes(ix) ? 0 : null))
  }

  protected updateLinearAxisOnY = (g: Selection<SVGGElement, number, SVGGElement, void>) => {
    g.attr('transform', (v) => `translate(0, ${this.scaleLinear(v)})`)
    g.select('line')
      .attr('y1', null)
      .attr('y2', null)
      .attr('x1', this.margin.left)
      .attr('x2', this.svg.width - this.margin.right)
      .attr('stroke', COLOR_DIAGRAM_TICK_LINE)

    g.select('text')
      .attr('text-anchor', null)
      .attr('dx', this.margin.left - 4)
      .attr('dy', null)
      .text((v) => adminFormatNum(v, undefined))
    return g
  }
  protected updateLinearAxisOnX = (g: Selection<SVGGElement, number, SVGGElement, void>) => {
    g.attr('transform', (v) => `translate(${this.scaleLinear(v)}, 0)`)
    g.select('line')
      .attr('y1', this.margin.top)
      .attr('y2', this.svg.height - this.margin.bottom)
      .attr('x1', null)
      .attr('x2', null)
      .attr('stroke', COLOR_DIAGRAM_TICK_LINE)

    g.select('text')
      .attr('text-anchor', (_, ix, arr) => (ix === arr.length - 1 ? 'end' : null))
      .attr('dx', (_, ix, arr) => (ix === arr.length - 1 ? ASSUMED_CHAR_WIDTH / 2 : null))
      .attr('dy', this.margin.top / 2)
      .text((v) => adminFormatNum(v, undefined))
    return g
  }

  protected drawColumns() {
    this.dataGrp.attr('fill', this.colors[0])
    const idFn = (v: T) => v.id
    const v0 = <number>this.scaleLinear(0)

    const bandwidth = this.scaleBand.bandwidth()

    // 20px is the threshold -> <20 -> no padding between the 2 cols, >20 -> 2px innergap
    const innerGap = bandwidth > 20 ? 2 : 0
    const availableColGrpSpace = bandwidth - innerGap

    // 8 is the minimum padding between the col-groups ( [][]<--padding-->[][] )
    const padding =
      availableColGrpSpace < 80
        ? 8
        : availableColGrpSpace < 160
        ? bandwidth / 5 // 10%
        : availableColGrpSpace < 200
        ? bandwidth / 3 // 20%
        : bandwidth / 3 // 33.3%

    const colWidth = (availableColGrpSpace - padding) / 2

    // x-translate
    const tx = bandwidth / 2 - colWidth - innerGap / 2

    const colGrps = this.dataGrp
      .selectAll('g')
      .data(this.data, <any>idFn)
      .join('g')
      .attr('transform', ({ id }) => `translate(${<number>this.scaleBand(id) + tx}, 0)`)

    const domainMax = this.scaleLinear.domain()[1]

    colGrps
      .selectAll('rect')
      .data((e: T) => e.values)
      .join('rect')
      .attr('transform', (_, ix) => (ix === 0 ? null : `translate(${colWidth + innerGap}, 0)`))
      .attr('y', (val) => <number>this.scaleLinear(val ?? domainMax))
      .attr('height', (val) => v0 - <number>this.scaleLinear(val ?? domainMax))
      .attr('width', colWidth)
      .attr('fill', this.fillFn)
  }

  protected drawBars() {
    this.dataGrp.attr('fill', this.colors[0])
    const idFn = (v: T) => v.id
    const v0 = <number>this.scaleLinear(0)

    const tx = (this.scaleBand.bandwidth() - VERT_INNER_PADDING) / 2 - VERT_BAND_SIZE

    const colGrps = this.dataGrp
      .selectAll('g')
      .data(this.data, <any>idFn)
      .join('g')
      .attr('transform', ({ id }) => `translate(${v0}, ${<number>this.scaleBand(id) + tx})`)

    colGrps
      .selectAll('rect')
      .data((e: T) => e.values)
      .join('rect')
      .attr('transform', (_, ix) => (ix === 0 ? null : `translate(0, ${VERT_BAND_SIZE + VERT_INNER_PADDING})`))
      .attr('y', null)
      .attr('height', VERT_BAND_SIZE)
      .attr('width', (val) => <number>this.scaleLinear(val || 0) - v0)
      .attr('fill', this.fillFn)
  }

  protected drawRefLines(): DOMRect[] {
    const updateFn = this.isHorizontal
      ? (g: Selection<SVGGElement, [number, boolean], SVGGElement, void>) => {
          g.attr('transform', ([v]) => `translate(0, ${this.scaleLinear(v)})`)

          g.select('line')
            .attr('x1', this.margin.left)
            .attr('x2', this.svg.width - this.margin.right)
            .attr('y1', null)
            .attr('y2', null)

          g.select('text')
            .attr('dy', null)
            .attr('dx', this.margin.left)
            .attr('dominant-baseline', ([, isLargerOrEqual]) =>
              isLargerOrEqual ? 'text-after-edge' : 'text-before-edge',
            )
            .attr('text-anchor', 'end')
            .text(([v]) => adminFormatNum(v, 2))

          return g
        }
      : (g: Selection<SVGGElement, [number, boolean], SVGGElement, void>) => {
          g.attr('transform', ([v]) => `translate(${this.scaleLinear(v)}, 0)`)

          g.select('line')
            .attr('x1', null)
            .attr('x2', null)
            .attr('y1', this.margin.top)
            .attr('y2', this.svg.height - this.margin.bottom)

          g.select('text')
            .attr('dy', this.margin.top / 2)
            .attr('dx', ([, isLargerOrEqual]) => (isLargerOrEqual ? 2 : -2))
            .attr('dominant-baseline', 'central')
            .attr('text-anchor', ([, isLargerOrEqual]) => (isLargerOrEqual ? 'start' : 'end'))
            .text(([v]) => adminFormatNum(v, 2))

          return g
        }

    const createFn = (enter: Selection<EnterElement, [number, boolean], SVGGElement, void>) => {
      const g = enter.append('g').attr('color', (_, ix) => (this.refColors ? this.refColors[ix] : null))
      g.append('line')
        .attr('stroke', 'currentColor')
        .attr('stroke-width', 2)
        .attr('opacity', (_, ix) => (ix === 0 ? 0.5 : null))
      g.append('text').attr('font-weight', 'bold').attr('fill', 'currentColor')
      return updateFn(g)
    }

    const values: (number | null)[] = this.refValues || []
    const grps = this.refGrp
      .selectAll('g')
      .data(values.map((v, ix, arr) => <[number, boolean]>[v, v && v >= (arr[ix === 0 ? 1 : 0] || 0)]))
      .join(createFn, <any>updateFn)
      .attr('opacity', ([v]) => isDefined(v))

    return grps
      .select<SVGTextElement>('text')
      .nodes()
      .map((node) => node.getBoundingClientRect())
  }

  protected createScales() {
    this.margin = this.isHorizontal
      ? {
          top: 20,
          right: 0,
          bottom: 20,
          left: this.linearAxisLabelsMaxLength * ASSUMED_CHAR_WIDTH + 8,
        }
      : {
          top: 20,
          right: 8,
          bottom: 8,
          left: this.bandAxisLabelsMaxLength * ASSUMED_CHAR_WIDTH + 8,
        }

    const yRange: [number, number] = [this.svg.height - this.margin.bottom, this.margin.top]
    const xRange: [number, number] = [this.margin.left, this.svg.width - this.margin.right]

    this.scaleBand = scaleBand<string>()
      .domain(this.data.map((e) => e.id))
      .range(this.isHorizontal ? xRange : <[number, number]>yRange.reverse())

    this.scaleLinear = this.createLinearDomain().range(this.isHorizontal ? yRange : xRange)

    this.scaleBandInvert = invert(this.scaleBand)
  }

  protected getLinearAxisTicks(linearScale: ScaleLinear<number, number>): number[] {
    return linearScale.ticks(TICK_COUNT)
  }

  private calcValueLabelsMaxLength(): number {
    const scale = this.createLinearDomain()
    return Math.max(
      ...[...this.getLinearAxisTicks(scale), ...(this.refValues || [])]
        .map((v) => adminFormatNum(v, undefined))
        .map((v) => v.length),
    )
  }

  /** create basic scaleLinear for Y-Axis without range (domain only) */
  private createLinearDomain() {
    const domainMax = calcDomainEnd(this.maxValue, TICK_COUNT + 1)
    return scaleLinear().domain([0, domainMax])
  }

  protected mapSvgPointToDomainData(point: DOMPoint): undefined | [number, T] {
    const bandPos = this.isHorizontal ? point.x - this.margin.left : point.y - this.margin.top
    const targetId = this.scaleBandInvert(bandPos)
    const item = this.data.find(({ id }) => id === targetId)
    return item ? [<number>this.scaleBand(item.id) + this.scaleBand.bandwidth() / 2, item] : undefined
  }

  protected mapToEventAndTooltipData([bandPos, item]: [number, T]): FocusedElValues<T> {
    const point = this.svg.svgEl.createSVGPoint()
    if (this.isHorizontal) {
      point.x = bandPos
      point.y = <number>this.scaleLinear(Math.max(0, ...item.values.filter(isDefined)))
    } else {
      point.y = bandPos
      point.x = <number>this.scaleLinear(item.values[1] || 0)
    }
    const source: DOMPoint = point.matrixTransform(<DOMMatrixInit>this.svg.svgEl.getScreenCTM())

    const groups: Selection<SVGGElement, T, SVGGElement, void> = this.dataGrp.selectAll('g')
    return [source, item, groups.filter((v) => v.id === item.id)]
  }

  protected setElIntoFocus([source, data, barGrp]: FocusedElValues<T>) {
    this.elFocus.emit({ source, data, direction: this.direction })
    barGrp.selectAll<SVGRectElement, number | null>('rect').attr('fill', this.hoverFillFn)

    if (this.isHorizontal) {
      this.focusEl
        .attr('x1', this.margin.left)
        .attr('x2', this.svg.width - this.margin.right)
        .attr('transform', `translate(0, ${this.scaleLinear(data.values[data.values.length - 1] || 0)})`)
    } else {
      this.focusEl
        .attr('y1', this.margin.top - 2)
        .attr('y2', this.svg.height - this.margin.bottom)
        .attr('transform', `translate(${this.scaleLinear(data.values[data.values.length - 1] || 0)}, 0)`)
    }
  }

  protected setElOutFocus([source, data, barGrp]: FocusedElValues<T>) {
    this.elBlur.emit({ source, data, direction: this.direction })
    this.focusEl.attr('x1', null).attr('x2', null).attr('y1', null).attr('y2', null)
    barGrp.selectAll<SVGRectElement, number | null>('rect').attr('fill', this.fillFn)
  }

  protected focusLost() {
    this.diagramLeave.emit()
  }

  protected readonly fillFn = (val: number | null, index: number) => {
    return isDefined(val) ? this.colors[index] : this.svg.noDataFill
  }
  protected readonly hoverFillFn = (val: number | null, index: number) => {
    return isDefined(val) ? this.hoverColors[index] : this.svg.noDataFill
  }
}
