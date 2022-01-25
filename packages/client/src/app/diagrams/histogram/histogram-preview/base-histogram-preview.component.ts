import { Component, Input } from '@angular/core'
import { COLOR_DIAGRAM_TICK_LINE, COLOR_DIAGRAM_TICK_TEXT } from '../../../shared/commons/colors.const'
import { BaseHistogramComponent, HistogramEntry } from '../base-histogram.component'

@Component({ template: '' })
export abstract class BaseHistogramPreviewComponent<T extends HistogramEntry> extends BaseHistogramComponent<T> {
  @Input()
  set facet(facet: 'report' | undefined) {
    this._facet = facet
    if (facet === 'report') {
      this.svgRatio = [137, 24]
      this.svgMinHeight = '24mm'
      this.margin = { top: 16, bottom: 12, left: 0, right: 0 }
      this.fontSize = 8
    }
  }

  get facet() {
    return this._facet
  }

  svgRatio: [number, number] = [389, 140]
  svgMinHeight = '140px'

  protected override margin = { top: 20, right: 0, bottom: 20, left: 0 }
  protected yTickCount = 2
  protected fontSize = 12

  private _facet?: 'report'

  protected override setupChart() {
    super.setupChart(this.fontSize)
    this.xAxisLine.attr('stroke', COLOR_DIAGRAM_TICK_LINE)
    if (this.facet !== 'report') {
      this.xAxisGrp.attr('fill', COLOR_DIAGRAM_TICK_TEXT)
    }
    this.yAxisGrp.attr('text-anchor', 'start')
  }
}
