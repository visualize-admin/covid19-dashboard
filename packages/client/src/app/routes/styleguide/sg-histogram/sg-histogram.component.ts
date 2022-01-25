import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { isDefined } from '@c19/commons'
import { addDays, addMonths, addWeeks } from 'date-fns'
import { HistogramAreaEntry } from '../../../diagrams/histogram/histogram-area/histogram-area.component'
import { HistogramDetailEntry } from '../../../diagrams/histogram/histogram-detail/histogram-detail.component'
import { HistogramLineEntry } from '../../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramMenuEntry } from '../../../diagrams/histogram/histogram-menu/histogram-menu.component'
import { HistogramPreviewEntry } from '../../../diagrams/histogram/histogram-preview/histogram-preview.component'
import { MatrixElementEvent } from '../../../diagrams/matrix/base-matrix.component'
import { COLORS_HOSP_CAP_BARS } from '../../../shared/commons/colors.const'
import { TooltipService } from '../../../shared/components/tooltip/tooltip.service'
import { formatUtcDate } from '../../../static-utils/date-utils'

@Component({
  selector: 'bag-sg-histogram',
  templateUrl: './sg-histogram.component.html',
  styleUrls: ['./sg-histogram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SgHistogramComponent {
  @ViewChild('tooltip', { static: true, read: TemplateRef })
  tooltipElRef: TemplateRef<{ title: string; values: (number | null)[] }>

  readonly selectionStartDate = new Date('2020-09-01')
  readonly barColors = COLORS_HOSP_CAP_BARS

  previewData: HistogramPreviewEntry[]
  menuData: HistogramMenuEntry[]
  detailData: HistogramDetailEntry[]
  lineData: HistogramLineEntry[]
  areaData: HistogramAreaEntry[]
  areaStackData: HistogramAreaEntry[]

  readonly spanGapsCtrl = new FormControl(false)

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
  readonly percentageFmt = (val: number) => `${val}%`
  changeData() {
    const startDate = this.dataStartDates[(this.currentDataIx = (this.currentDataIx + 1) % this.dataStartDates.length)]
    this.detailData = this.createDetailData(startDate)
    this.previewData = this.createPreviewData(startDate)
    this.menuData = this.createPreviewData(startDate).map(
      ({ date, barValues }): HistogramMenuEntry => ({
        date,
        value: barValues[0],
      }),
    )
    this.lineData = this.createLineData(startDate)
    this.areaData = this.createAreaData(startDate)
    this.areaStackData = this.createAreaStackData(startDate)
  }

  showHistogramAreaStackTooltip({ source, data }: MatrixElementEvent<HistogramAreaEntry>) {
    this._showTooltip(source, { title: formatUtcDate(data.date), values: data.values })
  }

  hideTooltip() {
    this.tooltipService.hide()
  }

  private createPreviewData(start: Date, end: Date = new Date(), fillWithNull = false): HistogramPreviewEntry[] {
    const items: HistogramPreviewEntry[] = []
    let currentDate = start

    let v1 = 10

    while (currentDate < end) {
      v1++
      items.push({
        date: currentDate,
        barValues: [fillWithNull ? null : v1 + (Math.random() - 0.5) * 10],
        lineValues: [],
      })
      currentDate = addDays(currentDate, 1)
    }
    return fillWithNull
      ? items
      : items.map(({ date, barValues }, ix) => ({
          date,
          barValues,
          lineValues: [
            ix < 2 || ix > items.length - 3
              ? null
              : // tslint:disable-next-line:no-non-null-assertion
                items.slice(ix - 2, ix + 3).reduce((u, i) => u + i.barValues[0]!, 0) / 5,
          ],
        }))
  }

  private createLineData(start: Date, end: Date = new Date(), fillWithNull = false): HistogramLineEntry[] {
    const items: HistogramLineEntry[] = []
    let currentDate = start

    let v1 = 10

    while (currentDate < end) {
      v1++
      items.push({
        date: currentDate,
        values: [fillWithNull ? null : v1 + (Math.random() - 0.5) * 10, null],
      })
      currentDate = addDays(currentDate, 1)
    }
    return fillWithNull
      ? items
      : items.map(({ date, values }, ix) => ({
          date,
          values: [
            values[0],
            ix < 2 || ix > items.length - 3
              ? null
              : // tslint:disable-next-line:no-non-null-assertion
                items.slice(ix - 2, ix + 3).reduce((u, i) => u + i.values[0]!, 0) / 5,
            ix % 6 > 2 && isDefined(values[0]) ? values[0] / 2 : null,
          ],
        }))
  }

  private createAreaData(start: Date, end: Date = new Date()): HistogramAreaEntry[] {
    const items: HistogramAreaEntry[] = []
    let currentDate = start

    let v1 = 10

    while (currentDate < end) {
      v1++
      items.push({
        date: currentDate,
        values: [v1 + (Math.random() - 0.5) * 10, null],
      })
      currentDate = addDays(currentDate, 1)
    }
    return items.map(({ date, values }, ix) => ({
      date,
      values: [
        values[0],
        // tslint:disable-next-line:no-non-null-assertion
        items.slice(ix - 2, ix + 3).reduce((u, i) => u + i.values[0]!, 0) / 5,
      ],
    }))
  }

  private createAreaStackData(start: Date, end: Date = new Date()): HistogramAreaEntry[] {
    const items: HistogramAreaEntry[] = []
    let currentDate = start

    while (currentDate < end) {
      const v1 = Math.floor(Math.random() * 51)
      const v2 = Math.floor(Math.random() * 41)
      items.push({
        date: currentDate,
        values: [v1, v2, 100 - v1 - v2],
      })
      currentDate = addDays(currentDate, 1)
    }
    return items
  }

  private createDetailData(start: Date, end: Date = new Date(), fillWithNull = false): HistogramDetailEntry[] {
    const items: HistogramDetailEntry[] = []
    let currentDate = start

    let v1 = 10
    while (currentDate < end) {
      v1++
      items.push({
        date: currentDate,
        barValues: fillWithNull ? [null] : [v1 + (Math.random() - 0.5) * 10, Math.random() * 10],
        lineValues: [null, null],
      })
      currentDate = addDays(currentDate, 1)
    }
    return fillWithNull
      ? items
      : items.map(({ date, barValues }, ix) => ({
          date,
          barValues,
          lineValues: [
            ix < 2 || ix > items.length - 3
              ? null
              : // tslint:disable-next-line:no-non-null-assertion
                items.slice(ix - 2, ix + 3).reduce((u, i) => u + i.barValues[0]!, 0) / 5,

            ix < 2 || ix > items.length - 3
              ? null
              : // tslint:disable-next-line:no-non-null-assertion
                items.slice(ix - 2, ix + 3).reduce((u, i) => u + i.barValues[1]!, 0) / 5,
          ],
        }))
  }

  private _showTooltip(source: Element | DOMPoint, ctx: { title: string; values: (number | null)[] }) {
    this.tooltipService.showTpl(source, this.tooltipElRef, ctx, { position: ['before', 'after'], offsetX: 16 })
  }
}
