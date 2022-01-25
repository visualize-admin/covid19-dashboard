import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core'
import { isDefined } from '@c19/commons'
import { Line, Selection } from 'd3'
import { isSameDay } from 'date-fns'
import { COLOR_NO_CASE, COLORS_HISTOGRAM_DEFAULT } from '../../../shared/commons/colors.const'
import { hexToRgb, rgbToHex } from '../../utils'
import { HistogramEntry, NoDataBlock } from '../base-histogram.component'
import { InteractiveHistogramComponent } from '../interactive-histogram.component'

export interface HistogramDetailEntry extends HistogramEntry {
  barValues: Array<number | null>
  lineValues: Array<number | null>
  exists?: boolean
}

const sum = (u: number, i: number | null | undefined): number => u + (i || 0)

@Component({
  selector: 'bag-histogram-detail',
  templateUrl: './histogram-detail.component.html',
  styleUrls: ['./histogram-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramDetailComponent<T extends HistogramDetailEntry>
  extends InteractiveHistogramComponent<T>
  implements OnChanges
{
  @Input() titleKey?: string

  @Input()
  override set data(data: T[]) {
    super.data = data
    // create d3-lineFunction per line so we can iterate over them in the d3 `.data(...)` style
    this.lineFunctions = new Array(this.data.reduce((u, i) => Math.max(u, i.lineValues.length), 0))
      .fill(0)
      .map((_, ix) => [ix, this.createLine((v) => v.lineValues[ix])])
    this.yMaxValue =
      Math.max(
        ...data.reduce((u, i) => [...u, i.barValues.reduce(sum, 0), ...i.lineValues.map((v) => v || 0)], <number[]>[]),
      ) || 1
  }

  override get data() {
    return super.data
  }

  @Input()
  set barColors(colors: string[]) {
    this._barColors = colors
    this.barHoverColors = colors
      .map(
        (c) => <[number, number, number]>hexToRgb(c.startsWith('url') ? '#FFFFFF' : c).map((v) => Math.round(v * 0.85)),
      )
      .map(rgbToHex)
  }

  get barColors(): string[] {
    return this._barColors
  }

  @Input()
  patternBgColor?: string | null | undefined

  barHoverColors: string[]

  @Input()
  lineColors: string[]

  @Input()
  lineThickness: number[]

  @Input()
  skipNoDataBlocksBefore: Date | null

  @Input()
  skipNoDataBlocksAfter: Date | null

  @Input()
  barOpacity = 0.8

  @Input()
  yTickCount = 4

  @Input()
  maxHeight?: number | null

  get svgMaxHeight(): string | null {
    return this.maxHeight ? `${this.maxHeight}px` : null
  }

  get svgMinHeight(): string {
    const min = this.maxHeight ? Math.min(312, this.maxHeight) : 312
    return `${min}px`
  }

  get svgRatio(): [number, number] | null {
    return this.maxHeight ? null : [994, 312]
  }

  protected yMaxValue: number

  @Input()
  protected override margin = { top: 20, bottom: 20, left: 0, right: 8 }
  protected linesGroup: Selection<SVGGElement, void, null, void>
  protected valueDomainRect: Selection<SVGRectElement, void, null, undefined>
  protected lineFunctions: Array<[number, Line<T>]>

  private notExistingBlocks: NoDataBlock<T>[]
  private _barColors: string[] = COLORS_HISTOGRAM_DEFAULT

  override ngOnChanges(changes: SimpleChanges) {
    if (this.data) {
      const doesExistsFn = (v: T): boolean => v.exists ?? true // true if not set
      const hasDataFn = (v: T): boolean =>
        !doesExistsFn(v) || // exclude entries, which are displayed as not existing
        v.barValues.some(isDefined) ||
        (!!this.skipNoDataBlocksBefore && v.date < this.skipNoDataBlocksBefore) ||
        (!!this.skipNoDataBlocksAfter && v.date > this.skipNoDataBlocksAfter)

      this.noDataBlocks = this.calcNoDataBlocks(hasDataFn)
      this.notExistingBlocks = this.calcNoDataBlocks(doesExistsFn)
    }

    // super.ngOnChanges repaints, noDataBlocks need to be set before repaint
    super.ngOnChanges(changes)
  }

  protected override setupChart() {
    super.setupChart()

    this.dataGrp.attr('shape-rendering', 'crispEdges').attr('opacity', this.barOpacity)

    this.xAxisLine.attr('stroke', 'currentColor')

    this.linesGroup = this.svg.svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')

    this.valueDomainRect = this.svg.svg.append('rect').attr('fill', 'transparent').attr('stroke', 'none')
  }

  protected override createScales() {
    this.margin = {
      ...this.margin,
      left: this.getYLabelsMaxLength() * HistogramDetailComponent.ASSUMED_CHAR_WIDTH + 8,
    }
    super.createScales()
  }

  protected paint() {
    this.drawNoDataBlocks()
    this.drawNoDataBlocks(this.notExistingBlocks, 'not-exists', COLOR_NO_CASE)
    this.drawStackedBars((t: T) => t.barValues, this._barColors)
    this.updateBarColors()
    this.drawLines()
    this.drawFullYAxis()
    this.drawFullXAxis(this.withWeeklyValues)
    this.updateValueDomain(this.valueDomainRect)
  }

  protected drawLines() {
    this.linesGroup
      .selectAll('path')
      .data(this.lineFunctions)
      .join('path')
      .attr('d', ([, lineFn]) => <string>lineFn(this.data))
      .attr('stroke', ([ix]) => this.lineColors[ix])
      .attr('stroke-width', ([ix]) => this.lineThickness[ix])
  }

  protected mapToEventAndTooltipData([x, item]: [number, T]): [DOMPoint, T] {
    const total = item.barValues.reduce(sum, 0)
    const maxVal = Math.max(...item.lineValues.filter(isDefined), total, this.domainMin)
    const y = <number>this.scaleLinearY(maxVal)

    const point = this.svg.svgEl.createSVGPoint()
    point.x = x
    point.y = y
    const source: DOMPoint = point.matrixTransform(<DOMMatrixInit>this.svg.svgEl.getScreenCTM())
    return [source, item]
  }

  protected override setElIntoFocus([source, data]: [DOMPoint, T]) {
    super.setElIntoFocus([source, data])
    const g = this.findBarGroup(data)
    g.selectAll('rect').attr('fill', (_, ix) =>
      this._barColors[ix].startsWith('url')
        ? this._barColors[0].replace(')', `${this.svg.idCounter})`)
        : this.barHoverColors[ix],
    )
  }

  protected override setElOutFocus([source, data]: [DOMPoint, T]) {
    super.setElOutFocus([source, data])
    const g = this.findBarGroup(data)
    g.selectAll('rect').attr('fill', (_, ix) => (ix === 0 ? null : this.barColors[ix]))
  }

  private findBarGroup(data: T) {
    const groups: Selection<SVGGElement, T, SVGGElement, void> = this.dataGrp.selectAll('g')
    return groups.filter((v) => isSameDay(v.date, data.date))
  }

  private updateBarColors() {
    this.dataGrp.attr(
      'fill',
      this._barColors[0].startsWith('url')
        ? this._barColors[0].replace(')', `${this.svg.idCounter})`)
        : this._barColors[0],
    )
  }
}
