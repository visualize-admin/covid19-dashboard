import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { COLOR_RANGE_1, COLOR_RANGE_2, COLOR_RANGE_3, COLOR_RANGE_4 } from '../../../shared/commons/colors.const'
import { HistogramLineEntry } from './histogram-line.component'
import { HistogramLineRefGradientComponent } from './histogram-line-ref-gradient.component'

@Component({
  selector: 'bag-histogram-line-ref-inz14d',
  templateUrl: './histogram-line.component.html',
  styleUrls: ['./histogram-line.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramLineRefInz14dComponent<
  T extends HistogramLineEntry,
> extends HistogramLineRefGradientComponent<T> {
  protected readonly ranges = [60, 120, 240]
  protected readonly rangeColors = [COLOR_RANGE_1, COLOR_RANGE_2, COLOR_RANGE_3, COLOR_RANGE_4]

  override set color(color: string) {}

  override get color() {
    return super.color
  }

  // override super
  protected override paint() {
    // do not call super
    this.drawFullXAxis()
    // this.drawFullYAxis()
    this.drawInzCase14dYAxis()
    this.drawHighlightYTickAt(60)
    this.drawLines()
    this.updateValueDomain(this.valueDomainRect)
    this.defineGradient(this.ranges, this.rangeColors)
  }

  protected drawInzCase14dYAxis() {
    const scaleEnd = this.scaleLinearY.domain()[1]
    // 0, 60, 120, 240, 480, 960, 1920, 3840, ...
    const yAxisTicks = [0]
    for (let x = 60; x < scaleEnd; x *= 2) {
      yAxisTicks.push(x)
    }
    yAxisTicks.push(scaleEnd)
    // const yAxisTicks = this.getYAxisTicks(this.scaleLinearY)
    const idFn = (v: number) => v

    this.yAxisGrp
      .selectAll('g')
      .data(yAxisTicks, <any>idFn)
      .join(this.createFullYAxisTick, <any>this.updateFullYAxisTick)
  }
}
