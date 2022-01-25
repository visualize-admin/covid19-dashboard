import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { COLOR_RANGE_1, COLOR_RANGE_2, COLOR_RANGE_3 } from '../../../shared/commons/colors.const'
import { HistogramLineEntry } from './histogram-line.component'
import { HistogramLineRefGradientComponent } from './histogram-line-ref-gradient.component'

@Component({
  selector: 'bag-histogram-line-ref-re',
  templateUrl: './histogram-line.component.html',
  styleUrls: ['./histogram-line.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistogramLineRefReComponent<T extends HistogramLineEntry> extends HistogramLineRefGradientComponent<T> {
  @Input()
  override set data(data: T[]) {
    super.data = data
    this.yMaxValue = Math.max(...data.reduce((u, i) => [...u, ...i.values.map((v) => v || 0), 1.5], <number[]>[]))
  }

  override get data() {
    return super.data
  }

  protected readonly ranges = [0.8, 1]
  protected readonly rangeColors = [COLOR_RANGE_1, COLOR_RANGE_2, COLOR_RANGE_3]

  // override super
  protected override paint() {
    // do not call super
    this.drawFullXAxis()
    this.drawFullYAxis()
    this.drawHighlightYTickAt(1)
    this.drawRange()
    this.drawLines()
    this.updateValueDomain(this.valueDomainRect)
    this.defineGradient(this.ranges, this.rangeColors)
  }
}
