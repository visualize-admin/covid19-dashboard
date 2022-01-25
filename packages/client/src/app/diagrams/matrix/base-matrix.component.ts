import { Platform } from '@angular/cdk/platform'
import { DOCUMENT } from '@angular/common'
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { isDefined } from '@c19/commons'
import { scaleBand, ScaleBand, Selection } from 'd3'
import { Subject } from 'rxjs'
import { COLOR_DIAGRAM_TICK_TEXT, COLOR_NO_CASE } from '../../shared/commons/colors.const'
import { D3SvgComponent } from '../../shared/components/d3-svg/d3-svg.component'
import { checkIntersection, invert, Stringifyable } from '../utils'

export interface MatrixBucketEntry {
  bucketName: string
  value: number
}

export interface MatrixEntry<K extends Stringifyable, T extends MatrixBucketEntry = MatrixBucketEntry> {
  key: K
  label?: string
  labelLast?: string
  buckets: T[]
  noData: boolean
  noCase: boolean
}

export interface MatrixElementEvent<DATA> {
  source: Element | DOMPoint
  data: DATA
}

@Component({ template: '' })
export abstract class BaseMatrixComponent<
  EVENT_DATA,
  K extends Stringifyable,
  T extends MatrixBucketEntry = MatrixBucketEntry,
  E extends MatrixEntry<K, T> = MatrixEntry<K, T>,
> implements OnChanges, AfterViewInit, OnDestroy
{
  protected static ASSUMED_CHAR_WIDTH = 7
  protected static NO_CASE_FILL = COLOR_NO_CASE

  @Input()
  set data(val: E[]) {
    this._data = val
    this.yAxisLabels = this.getYAxisLabels()
    this.computedYLabelMaxLength = Math.max(...this.yAxisLabels.map((n) => n.length))
    this.computedXLabelMaxLength = Math.max(
      ...this.data.map((v) => (isDefined(v.label) ? v.label : v.key.toString()).length),
    )
  }

  get data(): E[] {
    return this._data
  }

  @Input()
  yLabelMaxLength: number

  @Input()
  hideYAxis: boolean

  @Output()
  readonly elFocus = new EventEmitter<MatrixElementEvent<EVENT_DATA>>()

  @Output()
  readonly elBlur = new EventEmitter<MatrixElementEvent<EVENT_DATA>>()

  @Output()
  readonly diagramLeave = new EventEmitter<void>()

  @ViewChild(D3SvgComponent)
  svg: D3SvgComponent

  yAxisLabels: string[]
  protected scaleBandX: ScaleBand<K>
  protected scaleBandXinvert: (val: number) => K | undefined

  protected paddingX: number
  protected offsetX: number

  protected dataGrp: Selection<SVGGElement, void, null, undefined>
  protected yAxisGrp: Selection<SVGGElement, void, null, undefined>
  protected xAxisGrp: Selection<SVGGElement, void, null, undefined>
  protected focusGuide: Selection<SVGRectElement, void, null, undefined>

  protected get leftMargin() {
    return this.hideYAxis
      ? 1
      : 8 +
          (isDefined(this.yLabelMaxLength) ? this.yLabelMaxLength : this.computedYLabelMaxLength) *
            BaseMatrixComponent.ASSUMED_CHAR_WIDTH
  }

  get margin() {
    return {
      top: 1,
      bottom: 20,
      left: this.leftMargin,
      right: 1,
    }
  }

  get stacks(): Selection<SVGGElement, E, SVGGElement, void> {
    return this.dataGrp.selectAll('g')
  }

  protected readonly onDestroy = new Subject<void>()

  private _data: E[]
  private computedYLabelMaxLength: number
  private computedXLabelMaxLength: number
  private initialized = false

  constructor(protected readonly platform: Platform, @Inject(DOCUMENT) protected readonly doc: Document) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized && this.svg.isVisible) {
      this.paint()
    }
  }

  ngAfterViewInit() {
    this.setupChart()
    // repaint$ completes on destroy, no need for takeUntil
    this.svg.repaint$.subscribe(this.paint.bind(this))
    setTimeout(() => (this.initialized = true))
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  protected abstract getYAxisLabels(): string[]

  protected abstract createAdditionalScales(): void

  protected abstract drawStacks(stacks: Selection<SVGGElement, E, SVGGElement, void>): void

  protected abstract drawYAxis(): void

  protected setupChart() {
    this.dataGrp = this.svg.svg.append('g').attr('class', 'data')

    if (!this.hideYAxis) {
      this.yAxisGrp = this.svg.svg
        .append('g')
        .attr('class', 'y-axis')
        .attr('font-size', 12)
        .attr('font-family', 'inherit')
        .attr('text-anchor', 'end')
        .attr('fill', COLOR_DIAGRAM_TICK_TEXT)
    }

    this.xAxisGrp = this.svg.svg.append('g').attr('class', 'x-axis').attr('font-size', 12).attr('fill', '#333333')

    this.focusGuide = this.svg.svg
      .append('rect')
      .attr('class', 'focus-guide')
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 2)
  }

  /** called when data or svg-size changed */
  protected paint(): void {
    this.createScaleBandX()
    this.createAdditionalScales()
    this.drawMatrix()
    this.drawXAxis()
    if (!this.hideYAxis) {
      this.drawYAxis()
    }
  }

  protected drawMatrix() {
    const stacks = <Selection<SVGGElement, E, SVGGElement, void>>this.dataGrp.selectAll('g').data(this.data).join('g')
    this.drawStacks(stacks)
  }

  protected drawXAxis() {
    const lw = (this.computedXLabelMaxLength * BaseMatrixComponent.ASSUMED_CHAR_WIDTH + 4) * 2
    // first & last label have also contain the year (+ 2 * 5 Chars)
    const spaceForMax =
      (this.svg.width - this.margin.left - this.margin.right - 2 * 5 * BaseMatrixComponent.ASSUMED_CHAR_WIDTH) / lw
    const butMax = this.data.length > 10 ? 4 : this.data.length > 4 ? 2 : 1
    const everyNth = Math.max(butMax, Math.max(1, Math.floor(this.data.length / spaceForMax)))

    const bandwidth = this.scaleBandX.bandwidth()
    const labelData = [...this.data, this.data[this.data.length - 1]]
    const l = labelData.length - 1

    // @ts-ignore
    const axisGroups = this.xAxisGrp
      .selectAll('g')
      .data(labelData)
      .join((group) => {
        const g = group.append('g')
        g.append('line').attr('stroke', '#333333').attr('y2', 4)
        g.append('text').attr('dy', 16)
        return g
      })
      .attr(
        'transform',
        ({ key }, ix) =>
          `translate(${<number>this.scaleBandX(key) + (ix === l ? bandwidth : 0)}, ${
            this.svg.height - this.margin.bottom + 2
          })`,
      )
      .attr('opacity', (_, ix) => (ix === l || ix % everyNth === 0 ? 1 : 0))

    axisGroups
      .select('text')
      .attr('text-anchor', (e, ix) => (ix === 0 ? 'start' : ix === l ? 'end' : 'middle'))
      .text((e, ix) =>
        ix === l && isDefined(e.labelLast) ? e.labelLast : isDefined(e.label) ? e.label : e.key.toString(),
      )

    // we need to check for intersection of the last two ticks -- if so, remove the second last
    const visibleTicks = this.xAxisGrp.selectAll('g').filter((_, ix) => ix === l || ix % everyNth === 0)
    const visibleTickNodes = <SVGGElement[]>visibleTicks.nodes()
    const rects = <[DOMRect, DOMRect]>(
      visibleTickNodes
        .slice(visibleTickNodes.length - 2, visibleTickNodes.length)
        .map((node) => node.getBoundingClientRect())
    )
    if (rects.length > 1 && checkIntersection(rects[0], rects[1], 12)) {
      const nthToHide = Math.floor(this.data.length / everyNth) * everyNth + 1
      this.xAxisGrp.selectAll(`g:nth-child(${nthToHide})`).attr('opacity', 0)
    }
  }

  protected createScaleBandX() {
    const rangeWidth = this.svg.width - this.margin.right - this.margin.left
    this.paddingX = rangeWidth / this.data.length > 12 ? 2 : 0
    this.offsetX = this.paddingX / 2

    this.scaleBandX = scaleBand<K>()
      .domain(this.data.map((x) => x.key))
      .range([this.margin.left, this.svg.width - this.margin.right])

    this.scaleBandXinvert = invert(this.scaleBandX)
  }

  protected setElOutFocus = <EL extends SVGGraphicsElement>([elSelection, data]: [
    Selection<EL, any, any, any>,
    EVENT_DATA,
  ]) => {
    this.elBlur.emit({ source: <Element>elSelection.node(), data })
  }

  protected focusLost = () => {
    this.focusGuide.attr('opacity', 0)
    this.diagramLeave.emit()
  }
}
