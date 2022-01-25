import { AfterViewInit, ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { EnterElement, scaleBand, ScaleBand, Selection } from 'd3'
import { D3SvgComponent } from '../../../shared/components/d3-svg/d3-svg.component'
import { initMouseListenerOnValueDomain, invert, Stringifyable } from '../../utils'
import { MatrixBucketEntry, BaseMatrixComponent, MatrixEntry } from '../base-matrix.component'

export interface DefinedEntry<
  ME extends MatrixEntry<KEY, BE>,
  KEY extends Stringifyable,
  BE extends MatrixBucketEntry = MatrixBucketEntry,
> {
  id: string
  entry: ME
  bucketEntry: BE
}

export type HeatmapFillFn<T extends MatrixBucketEntry = MatrixBucketEntry> = (
  entry: T,
  instance: D3SvgComponent,
) => string | null

@Component({
  selector: 'bag-matrix-heatmap',
  templateUrl: './matrix-heatmap.component.html',
  styleUrls: ['./matrix-heatmap.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixHeatmapComponent<K extends Stringifyable, T extends MatrixBucketEntry, E extends MatrixEntry<K, T>>
  extends BaseMatrixComponent<DefinedEntry<E, K, T>, K, T, E>
  implements AfterViewInit
{
  @Input()
  fillFn: HeatmapFillFn<T>

  @Input()
  yLabelFormatter?: (v: string) => string

  get svgHeight(): string {
    return `${this.margin.top + this.margin.bottom + this.yAxisLabels.length * 32}px`
  }

  private readonly paddingY = 2
  private readonly offsetY = this.paddingY / 2
  private scaleBandY: ScaleBand<string>
  private scaleBandYinvert: (val: number) => string | undefined

  override ngAfterViewInit() {
    super.ngAfterViewInit()
    if (this.platform.isBrowser) {
      initMouseListenerOnValueDomain(
        this.onDestroy,
        this.doc,
        this.svg.svgEl,
        <SVGGElement>this.dataGrp.node(),
        this.mapSvgPointToDomainData,
        (a, b) => !!a && !!b && a.id === b.id,
        this.mapToEventAndTooltipData,
        this.setElIntoFocus,
        this.setElOutFocus,
        this.focusLost,
      )
    }
  }

  protected getYAxisLabels(): string[] {
    const names = new Set<string>()
    this.data.forEach((e) => e.buckets.forEach((b) => names.add(b.bucketName)))
    return Array.from(names.values())
  }

  protected createAdditionalScales() {
    this.createScaleBandY()
  }

  protected drawStacks(stacks: Selection<SVGGElement, E, SVGGElement, void>) {
    const bandSizeX = this.scaleBandX.bandwidth() - this.paddingX
    const bandSizeY = this.scaleBandY.bandwidth() - this.paddingY
    stacks
      .selectAll('rect')
      .data(({ buckets, key }) => buckets.map((b) => ({ ...b, key })))
      .join('rect')
      .attr('x', this.rectXFn)
      .attr('width', bandSizeX)
      .attr('y', this.rectYFn)
      .attr('height', bandSizeY)
      .attr('fill', (v) => this.fillFn(v, this.svg))
  }

  protected drawYAxis() {
    const bandwidth = this.scaleBandY.bandwidth()

    const update = (g: Selection<SVGGElement, string, SVGGElement, void>) => {
      return g
        .select('text')
        .attr('dy', bandwidth / 2 + 4)
        .text((n) => (this.yLabelFormatter ? this.yLabelFormatter(n) : n))
    }
    const create = (group: Selection<EnterElement, string, SVGGElement, void>) => {
      const g = group.append('g')
      g.append('text').attr('dx', -8)
      return update(g)
    }

    this.yAxisGrp
      .selectAll('g')
      .data(this.yAxisLabels)
      .join(create, <any>update)
      .attr('transform', (bucketName) => `translate(${this.leftMargin}, ${this.scaleBandY(bucketName)})`)
  }

  private createScaleBandY() {
    this.scaleBandY = scaleBand<string>()
      .domain(this.yAxisLabels)
      .range([this.margin.top, this.svg.height - this.margin.bottom])
    this.scaleBandYinvert = invert(this.scaleBandY)
  }

  private mapSvgPointToDomainData = (point: DOMPoint): DefinedEntry<E, K, T> | undefined => {
    const key = this.scaleBandXinvert(point.x - this.margin.left)
    const entry = this.data.find((e) => e.key === key)
    const bucketName = this.scaleBandYinvert(point.y - this.margin.top)
    const bucketEntry = entry ? entry.buckets.find((b) => b.bucketName === bucketName) : undefined
    return entry && bucketEntry
      ? { entry, bucketEntry, id: `${entry.key.toString()}_${bucketEntry.bucketName}` }
      : undefined
  }
  private mapToEventAndTooltipData = (
    data: DefinedEntry<E, K, T>,
  ): [Selection<SVGRectElement, T, SVGGElement, E>, DefinedEntry<E, K, T>] => {
    const rects: Selection<SVGRectElement, T, SVGGElement, E> = this.stacks
      .filter(({ key }) => key === data.entry.key)
      .selectAll('rect')
    const rect = rects.filter((bucket) => bucket.bucketName === data.bucketEntry.bucketName)
    return [rect, data]
  }
  private setElIntoFocus = ([rect, data]: [Selection<SVGRectElement, T, any, any>, DefinedEntry<E, K, T>]) => {
    this.focusGuide
      .attr('opacity', 1)
      .attr('x', parseFloat(rect.attr('x')) - this.offsetX)
      .attr('y', parseFloat(rect.attr('y')) - this.offsetY)
      .attr('width', parseFloat(rect.attr('width')) + this.paddingX)
      .attr('height', parseFloat(rect.attr('height')) + this.paddingY)
    this.elFocus.emit({ source: <Element>rect.node(), data })
  }

  private readonly rectXFn = ({ key }: { key: K }) => {
    return <number>this.scaleBandX(key) + this.offsetX
  }
  private readonly rectYFn = ({ bucketName }: T) => {
    return <number>this.scaleBandY(bucketName) + this.offsetY
  }
}
