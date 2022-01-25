import { AfterViewInit, ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { scaleLinear, ScaleLinear, Selection } from 'd3'
import { initMouseListenerOnValueDomain, Stringifyable } from '../../utils'
import { MatrixBucketEntry, BaseMatrixComponent, MatrixEntry } from '../base-matrix.component'

@Component({
  selector: 'bag-matrix-stack',
  templateUrl: './matrix-stack.component.html',
  styleUrls: ['./matrix-stack.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixStackComponent<K extends Stringifyable, T extends MatrixBucketEntry, E extends MatrixEntry<K, T>>
  extends BaseMatrixComponent<E, K, T, E>
  implements AfterViewInit
{
  @Input()
  bucketColors: string[]

  @Input()
  ratio?: [number, number]

  @Input()
  set yMax(val: number) {
    this._yMax = val
  }

  get yMax() {
    return this._yMax || 100
  }

  @Input()
  set yAxisTicks(val: number[]) {
    this._yAxisTicks = val
  }

  get yAxisTicks(): number[] {
    return this._yAxisTicks || [0, this.yMax / 2, this.yMax]
  }

  @Input()
  rulerAt?: number

  override get margin() {
    return {
      top: 8,
      bottom: 20,
      left: this.leftMargin,
      right: 1,
    }
  }

  get svgMinHeight(): string {
    return this.ratio ? `${this.ratio[1]}px` : `${this.margin.top + this.margin.bottom + 100}px`
  }

  get svgMaxHeight(): string | null {
    return this.ratio ? null : `${this.margin.top + this.margin.bottom + 100}px`
  }

  private _yMax?: number
  private _yAxisTicks?: number[]
  private scaleLinearY: ScaleLinear<number, number>

  private horizontalRuler: any

  override ngAfterViewInit() {
    super.ngAfterViewInit()
    if (this.platform.isBrowser) {
      initMouseListenerOnValueDomain(
        this.onDestroy,
        this.doc,
        this.svg.svgEl,
        <SVGGElement>this.dataGrp.node(),
        this.mapSvgPointToDomainData,
        (a, b) => !!a && !!b && a.key === b.key,
        this.mapToEventAndTooltipData,
        this.setElIntoFocus,
        this.setElOutFocus,
        this.focusLost,
      )
    }
  }

  protected override setupChart() {
    super.setupChart()
    this.horizontalRuler = this.svg.svg
      .append('line')
      .attr('class', 'horizontal-ruler')
      .attr('stroke', '#ffffff')
      .attr('stroke-dasharray', '4 4')
  }

  protected override paint() {
    super.paint()
    if (this.rulerAt) {
      this.drawRuler(this.rulerAt)
    } else {
      this.hideRuler()
    }
  }

  protected getYAxisLabels(): string[] {
    return this.yAxisTicks.map((v) => `${v}%`)
  }

  protected createAdditionalScales(): void {
    this.createScaleLinearY()
  }

  protected drawStacks(stacks: Selection<SVGGElement, E, SVGGElement, void>) {
    const bandSizeX = this.scaleBandX.bandwidth() - this.paddingX

    stacks
      .selectAll('rect')
      .data((entry) => entry.buckets.map((b) => ({ ...b, entry })))
      .join('rect')
      .attr('x', this.rectXFn)
      .attr('width', bandSizeX)
      .attr('y', this.rectYFn)
      .attr('height', this.rectHeightFn)
      .style('fill', this.rectFillFn)
  }

  protected drawRuler(rulerPos: number) {
    this.horizontalRuler
      .attr('transform', `translate(0, ${this.scaleLinearY(rulerPos)})`)
      .attr('x1', this.margin.left)
      .attr('x2', this.svg.width - this.margin.right)
  }

  protected hideRuler() {
    this.horizontalRuler.attr('x1', null).attr('transform', null)
  }

  protected drawYAxis() {
    this.yAxisGrp
      .selectAll('g')
      .data(this.yAxisTicks)
      .join((group) => {
        const g = group.append('g')
        g.append('text')
          .attr('dx', -8)
          .attr('dy', 4)
          .text((_, ix) => this.getYAxisLabels()[ix])
        g.append('line').attr('x1', -2).attr('x2', -6).attr('stroke', '#E5E5E5')
        return g
      })
      .attr('transform', (val) => `translate(${this.leftMargin}, ${this.scaleLinearY(val)})`)
  }

  private createScaleLinearY() {
    this.scaleLinearY = scaleLinear<number, number>()
      .domain([0, this.yMax])
      .range([this.svg.height - this.margin.bottom, this.margin.top])
  }

  private readonly rectXFn = ({ entry }: { entry: E }) => {
    return <number>this.scaleBandX(entry.key) + this.offsetX
  }
  private readonly rectYFn = ({ entry, value, bucketName }: T & { entry: E }, bucketIx: number) => {
    const summedHeight = entry.buckets.slice(0, bucketIx).reduce((acc, be) => acc + be.value, 0)
    return <number>this.scaleLinearY(entry.noCase || entry.noData ? this.yMax : this.yMax - summedHeight)
  }
  private readonly rectHeightFn = ({ entry, value }: T & { entry: E }, bucketIx: number) => {
    return this.computeStackHeight(entry.noCase || entry.noData ? this.yMax : value)
  }
  private readonly rectFillFn = ({ value, entry }: T & { entry: E }, bucketIx: number) => {
    return entry.noCase
      ? BaseMatrixComponent.NO_CASE_FILL
      : entry.noData
      ? this.svg.noDataFill
      : this.bucketColors[bucketIx]
  }
  private readonly computeStackHeight = (v: number) => {
    return <number>this.scaleLinearY(0) - <number>this.scaleLinearY(v)
  }

  private mapSvgPointToDomainData = (point: DOMPoint): E | undefined => {
    const key = this.scaleBandXinvert(point.x - this.margin.left)
    return this.data.find((e) => e.key === key)
  }
  private mapToEventAndTooltipData = (entry: E): [Selection<SVGGElement, E, any, any>, E] => {
    const stack = this.stacks.filter(({ key }) => key === entry.key)
    return [stack, entry]
  }
  private setElIntoFocus = ([group, data]: [Selection<SVGGElement, E, any, any>, E]) => {
    const rect = group.select('rect')
    this.focusGuide
      .attr('opacity', 1)
      .attr('x', parseFloat(rect.attr('x')) - this.offsetX)
      .attr('width', parseFloat(rect.attr('width')) + this.paddingX)
      .attr('y', <number>this.scaleLinearY(this.yMax) - 1)
      .attr('height', <number>this.scaleLinearY(0) - <number>this.scaleLinearY(this.yMax) + 2)

    this.elFocus.emit({ source: <Element>group.node(), data })
  }
}
