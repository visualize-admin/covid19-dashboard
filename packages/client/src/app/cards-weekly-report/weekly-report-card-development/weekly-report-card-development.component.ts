import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import {
  GdiObject,
  GdiSubset,
  isDefined,
  WeeklyDevelopmentTimelineValues,
  WeeklySituationReportDevelopmentCard,
} from '@c19/commons'
import { getISOWeek } from 'date-fns'
import { Observable } from 'rxjs'
import { map, mapTo, switchMap } from 'rxjs/operators'
import { HistogramDetailEntry } from '../../diagrams/histogram/histogram-detail/histogram-detail.component'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLOR_SUM_ANTIGEN, COLOR_SUM_PCR, COLOR_TOTAL } from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { BaseWeeklyReportCardComponent, CurrenWrValuesBase } from '../base-weekly-report-card.component'

interface ChartData {
  titleKey: string
  metaKey: string
  tooltipKey: string
  barColors: string[]
  entries: HistogramDetailEntry[]
}

interface HistogramDetailTestEntry extends HistogramDetailEntry {
  total: number | null
}

interface TestChartData {
  entries: HistogramDetailTestEntry[]
  colors: string[]
  posEntries: HistogramLineEntry[]
}

interface CurrentValues extends CurrenWrValuesBase {
  simpleChartData: ChartData[]
  testChartData: TestChartData
}

@Component({
  selector: 'bag-weekly-report-card-development',
  templateUrl: './weekly-report-card-development.component.html',
  styleUrls: ['./weekly-report-card-development.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportCardDevelopmentComponent extends BaseWeeklyReportCardComponent<WeeklySituationReportDevelopmentCard> {
  readonly cardDetailPath = RoutePaths.SHARE_DEVELOPMENT
  readonly cardKeyContext = `WeeklyReport.Card.Development`

  readonly currentValues$: Observable<CurrentValues> = this.isoWeekFilter$.pipe(
    switchMap((weekFilter) => this.onChanges$.pipe(mapTo(weekFilter))),
    map((isoWeek) => {
      const simpleChartData = this.createChartData(isoWeek)
      const testChartData = this.createTestChartData(isoWeek)
      return {
        isoWeek,
        currWeekStart: simpleChartData[0].entries[simpleChartData[0].entries.length - 1].date,
        prevWeekStart: simpleChartData[0].entries[simpleChartData[0].entries.length - 1].date,
        simpleChartData,
        testChartData,
      }
    }),
  )

  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))

  readonly yLabelFmt = (val: number) => `${val}%`

  readonly xWeeklyLabelFmt = (d: Date) =>
    this.translator.get('WeeklyReport.Card.Development.Chart.AxisLabel', {
      week: getISOWeek(d),
      year: formatUtcDate(d, 'yyyy'),
    })
  readonly xWeeklySubLabelFmt = (d: Date) =>
    this.translator.get('WeeklyReport.Card.Development.Chart.AxisSubLabel', { date: formatUtcDate(d, 'dd.MM.yyyy') })

  createDescription({ currWeekStart }: CurrentValues): string {
    return this.translator.get(`${this.cardKeyContext}.Description`, {
      currWeek: getISOWeek(currWeekStart),
      currDate: formatUtcDate(currWeekStart),
    })
  }

  showSimpleTooltip({ source, data }: HistogramElFocusEvent<HistogramDetailEntry>, key: string) {
    const [v0] = data.barValues

    const entries: TooltipListContentEntry[] = []
    if (isDefined(v0)) {
      entries.push({ label: this.translator.get(key), value: adminFormatNum(v0) })
    }
    const ctx: TooltipListContentData = {
      title: this.translator.get('WeeklyReport.Card.Development.Tooltip.Title', {
        currWeek: getISOWeek(data.date),
        currDate: formatUtcDate(data.date),
      }),
      entries,
      noData: entries.length === 0,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: 'above',
      offsetY: 16,
    })
  }

  showTestTooltip({ source, data }: HistogramElFocusEvent<HistogramDetailTestEntry>) {
    const [v0, v1] = data.barValues

    const entries: TooltipListContentEntry[] = []
    if (isDefined(v0)) {
      entries.push({
        label: this.translator.get('Commons.Tests.PCR'),
        value: adminFormatNum(v0),
        color: COLOR_SUM_PCR,
      })
    }
    if (isDefined(v1)) {
      entries.push({
        label: this.translator.get('Commons.Tests.Antigen'),
        value: adminFormatNum(v1),
        color: COLOR_SUM_ANTIGEN,
        borderBelow: true,
      })
    }
    if (isDefined(data.total) && isDefined(v1)) {
      entries.push({ label: this.translator.get('Commons.Total'), value: adminFormatNum(data.total) })
    }
    const ctx: TooltipListContentData = {
      title: this.translator.get('WeeklyReport.Card.Development.Tooltip.Title', {
        currWeek: getISOWeek(data.date),
        currDate: formatUtcDate(data.date),
      }),
      entries,
      noData: entries.length === 0,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: 'above',
      offsetY: 16,
    })
  }

  showTestPosTooltip({ source, data }: HistogramElFocusEvent<HistogramLineEntry>) {
    const [v0, v1] = data.values

    const entries: TooltipListContentEntry[] = []
    if (isDefined(v0)) {
      entries.push({
        label: this.translator.get('Commons.Tests.PCR'),
        value: adminFormatNum(v0, 2, '%'),
        color: COLOR_SUM_PCR,
      })
    }
    if (isDefined(v1)) {
      entries.push({
        label: this.translator.get('Commons.Tests.Antigen'),
        value: adminFormatNum(v1, 2, '%'),
        color: COLOR_SUM_ANTIGEN,
      })
    }

    const ctx: TooltipListContentData = {
      title: this.translator.get('WeeklyReport.Card.Development.Tooltip.Title', {
        currWeek: getISOWeek(data.date),
        currDate: formatUtcDate(data.date),
      }),
      entries,
      noData: entries.length === 0,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after'],
      offsetX: 16,
    })
  }

  private createTestChartData(isoWeek: number | null): TestChartData {
    const entries = this.data.curr[GdiObject.TEST]
    const indexOfCurrWeek = entries.findIndex((entry) => entry.isoWeek === isoWeek)
    const sliceEndIndex = indexOfCurrWeek === -1 ? entries.length : indexOfCurrWeek + 1
    const allEntries = this.data.curr[GdiObject.TEST].slice(0, sliceEndIndex)
    const posEntries: HistogramLineEntry[] = []
    const testEntries: HistogramDetailTestEntry[] = allEntries.map((entry) => {
      const date = parseIsoDate(entry.timeSpan.start)
      posEntries.push({
        date,
        values: [
          entry[GdiSubset.TEST_PCR].percentageWeek_posTest,
          entry[GdiSubset.TEST_ANTIGEN].percentageWeek_posTest,
        ],
      })
      return {
        date,
        barValues: [entry[GdiSubset.TEST_PCR].week, entry[GdiSubset.TEST_ANTIGEN].week],
        lineValues: [],
        total: entry[GdiSubset.TEST_ALL].week,
      }
    })

    return { colors: [COLOR_SUM_PCR, COLOR_SUM_ANTIGEN], entries: testEntries, posEntries }
  }

  private createChartData(isoWeek: number | null): ChartData[] {
    const entries = this.data.curr[GdiObject.CASE]
    const indexOfCurrWeek = entries.findIndex((entry) => entry.isoWeek === isoWeek)
    const sliceEndIndex = indexOfCurrWeek === -1 ? entries.length : indexOfCurrWeek + 1
    return [
      {
        titleKey: 'DetailCase.Title',
        metaKey: 'WeeklyReport.Card.Development.Case.Meta',
        tooltipKey: 'Commons.Cases',
        barColors: [COLOR_TOTAL],
        entries: this.mapWeeklyValuesToHistoEntries(this.data.curr[GdiObject.CASE].slice(0, sliceEndIndex)),
      },
      {
        titleKey: 'DetailHosp.Title',
        metaKey: 'WeeklyReport.Card.Development.Hosp.Meta',
        tooltipKey: 'WeeklyReport.Card.Development.Hosp.Tooltip',
        barColors: [COLOR_TOTAL],
        entries: this.mapWeeklyValuesToHistoEntries(this.data.curr[GdiObject.HOSP].slice(0, sliceEndIndex)),
      },
      {
        titleKey: 'DetailDeath.Title',
        metaKey: 'WeeklyReport.Card.Development.Death.Meta',
        tooltipKey: 'WeeklyReport.Card.Development.Death.Tooltip',
        barColors: [COLOR_TOTAL],
        entries: this.mapWeeklyValuesToHistoEntries(this.data.curr[GdiObject.DEATH].slice(0, sliceEndIndex)),
      },
    ]
  }

  private mapWeeklyValuesToHistoEntries(entries: WeeklyDevelopmentTimelineValues[]): HistogramDetailEntry[] {
    return entries.map((entry) => {
      return {
        date: parseIsoDate(entry.timeSpan.start),
        barValues: [entry.week],
        lineValues: [],
      }
    })
  }
}
