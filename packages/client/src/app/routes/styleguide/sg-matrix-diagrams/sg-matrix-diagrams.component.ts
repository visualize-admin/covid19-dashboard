import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core'
import { isDefined } from '@c19/commons'
import { scaleQuantize } from 'd3'
import { addDays, addMonths, addWeeks, endOfWeek, startOfWeek } from 'date-fns'
import { MatrixElementEvent, MatrixEntry } from '../../../diagrams/matrix/base-matrix.component'
import { DefinedEntry, HeatmapFillFn } from '../../../diagrams/matrix/matrix-heatmap/matrix-heatmap.component'
import { COLOR_NO_CASE, COLORS_MATRIX_HEATMAP_SCALE, COLORS_VACC_HEATMAP } from '../../../shared/commons/colors.const'
import { TooltipService } from '../../../shared/components/tooltip/tooltip.service'
import { formatUtcDate } from '../../../static-utils/date-utils'

type SgMatrixEntry = MatrixEntry<Date>

@Component({
  selector: 'bag-sg-matrix-diagrams',
  templateUrl: './sg-matrix-diagrams.component.html',
  styleUrls: ['./sg-matrix-diagrams.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SgMatrixDiagramsComponent {
  @ViewChild('tooltip', { static: true, read: TemplateRef })
  tooltipElRef: TemplateRef<{ title: string; value: number }>

  stackMatrixData: SgMatrixEntry[]
  stackMatrixMax: number

  heatmapMatrixData: {
    entries: SgMatrixEntry[]
    min: number
    max: number
    fillFn: HeatmapFillFn
  }

  singleBucketMatrixData: {
    entries: SgMatrixEntry[]
    min: number
    max: number
    fillFn: HeatmapFillFn
  }

  private currentDataIx = -1
  private readonly dataStartDates = [
    addWeeks(new Date(), -3),
    addMonths(new Date(), -3),
    addMonths(new Date(), -6),
    addMonths(new Date(), -12),
  ]

  constructor(private readonly tooltipService: TooltipService) {
    this.changeData()
  }

  showHeatmapTooltip({ source, data }: MatrixElementEvent<DefinedEntry<SgMatrixEntry, Date>>) {
    this._showTooltip(source, { title: data.bucketEntry.bucketName, value: data.bucketEntry.value })
  }

  showStackTooltip({ source, data }: MatrixElementEvent<SgMatrixEntry>) {
    this._showTooltip(source, { title: data.key.toString(), value: 100 })
  }

  hideTooltip() {
    this.tooltipService.hide()
  }

  changeData() {
    const startDate = this.dataStartDates[(this.currentDataIx = (this.currentDataIx + 1) % this.dataStartDates.length)]
    this.setHeatMapMatrixData(startDate)
    this.setMatrixStackData(startDate)
    this.setSingleBucketMatrixData(startDate)
  }

  private _showTooltip(source: Element | DOMPoint, ctx: { title: string; value: number }) {
    this.tooltipService.showTpl(source, this.tooltipElRef, ctx, {
      position: 'above',
      offsetY: 16,
    })
  }

  private setHeatMapMatrixData(startDate: Date) {
    const min = Math.floor(Math.random() * 20)
    const max = min + Math.ceil(Math.random() * 150)
    const scaleQuantizeZ = scaleQuantize<string>().domain([min, max]).range(COLORS_MATRIX_HEATMAP_SCALE)
    this.heatmapMatrixData = {
      min,
      max,
      entries: this.createMatrixHeatmapData(min, max, startDate, ['aaa', 'bbb', 'c', 'dd', 'eeeee', 'f']),
      fillFn: (e, svg) => {
        return !isDefined(e.value) ? svg.noDataFill : e.value > 0 ? <string>scaleQuantizeZ(e.value) : COLOR_NO_CASE
      },
    }
  }

  private setSingleBucketMatrixData(startDate: Date) {
    const min = Math.floor(Math.random() * 20)
    const max = min + Math.ceil(Math.random() * 150)
    const scaleQuantizeZ = scaleQuantize<string>().domain([min, max]).range(COLORS_VACC_HEATMAP)
    this.singleBucketMatrixData = {
      min,
      max,
      entries: this.createMatrixHeatmapData(min, max, startDate, ['Spitäler']),
      fillFn: (e, svg) => {
        return !isDefined(e.value) ? svg.noDataFill : e.value > 0 ? <string>scaleQuantizeZ(e.value) : COLOR_NO_CASE
      },
    }
  }

  private setMatrixStackData(startDate: Date) {
    this.stackMatrixData = this.createMatrixStackData(startDate)
  }

  private createMatrixHeatmapData(min: number, max: number, startWeek: Date, buckets: string[]): SgMatrixEntry[] {
    const endDate = endOfWeek(new Date())

    const data: SgMatrixEntry[] = []

    let weekStart = startOfWeek(startWeek)
    while (weekStart < endDate) {
      data.push({
        key: weekStart,
        label: formatUtcDate(weekStart, 'dd.MM'),
        buckets: buckets.map((bucketName) => ({
          bucketName,
          value: min + Math.floor(Math.random() * max * 100) / 100,
        })),
        noCase: false,
        noData: false,
      })
      weekStart = addWeeks(weekStart, 1)
    }
    data[data.length - 1].labelLast = formatUtcDate(addDays(weekStart, -1), 'dd.MM')
    return data
  }

  private createMatrixStackData(startWeek: Date): SgMatrixEntry[] {
    const buckets = ['A', 'B']
    const endDate = endOfWeek(new Date())

    const data: SgMatrixEntry[] = []

    let weekStart = startOfWeek(startWeek)
    while (weekStart < endDate) {
      let tot = 0
      data.push({
        key: weekStart,
        label: formatUtcDate(weekStart, 'dd.MM'),
        buckets: buckets.map((bucketName, ix) => {
          const value = ix === buckets.length - 1 ? 100 - tot : Math.floor(Math.random() * (100 - tot) * 10) / 10
          tot += value
          return { bucketName, value }
        }),
        noCase: false,
        noData: false,
      })
      weekStart = addWeeks(weekStart, 1)
    }
    data[data.length - 1].labelLast = formatUtcDate(addDays(weekStart, -1), 'dd.MM')
    return data
  }
}
