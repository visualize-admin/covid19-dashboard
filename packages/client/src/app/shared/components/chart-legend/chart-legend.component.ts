import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core'
import { TooltipService } from '../tooltip/tooltip.service'

@Component({
  selector: 'bag-chart-legend',
  templateUrl: './chart-legend.component.html',
  styleUrls: ['./chart-legend.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartLegendComponent {
  @Input() itemGap?: number | null

  @Input() justifyContentFlexEnd?: boolean

  @ViewChild('tooltipRef', { static: true, read: TemplateRef })
  tooltipHintRef: TemplateRef<{ key: string }>

  constructor(private readonly tooltipService: TooltipService) {}

  showHintTooltip(el: Element, key: string) {
    this.tooltipService.showTpl(el, this.tooltipHintRef, { key }, { position: ['above', 'below'], offsetY: 12 })
  }

  hideTooltip() {
    this.tooltipService.hide()
  }
}
