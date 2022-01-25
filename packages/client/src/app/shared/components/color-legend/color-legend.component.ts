import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core'
import { createColorScale } from '../../../diagrams/utils'

@Component({
  selector: 'bag-color-legend',
  templateUrl: './color-legend.component.html',
  styleUrls: ['./color-legend.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorLegendComponent implements OnChanges {
  @Input()
  min: number

  @Input()
  max: number

  @Input()
  titleKey: string

  @Input()
  noCasesKey?: string | null

  @Input()
  noDataKey?: string | null

  @Input()
  scaleColors: string[]

  @Input()
  colorTicks = 6

  @Input()
  isPercentage = false

  @Input()
  useScaleColorsOnly = false

  stepColors: string[]

  ngOnChanges(changes: SimpleChanges) {
    if ('ticks' in changes || 'scaleColors' in changes) {
      if (this.colorTicks && this.scaleColors) {
        this.stepColors = this.useScaleColorsOnly
          ? this.scaleColors
          : createColorScale(this.scaleColors, this.colorTicks)
      }
    }
  }
}
