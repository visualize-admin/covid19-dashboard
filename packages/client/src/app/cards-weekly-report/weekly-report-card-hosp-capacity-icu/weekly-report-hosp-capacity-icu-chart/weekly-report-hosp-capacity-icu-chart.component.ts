import { ChangeDetectionStrategy, Component, forwardRef, Inject, ViewEncapsulation } from '@angular/core'
import { HospCapacityWeeklyValues, InlineValues, TopLevelGeoUnit, WeeklyReportHospCapacityDataCard } from '@c19/commons'
import { getISOWeek } from 'date-fns'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { WeeklyReportDataPair } from '../../../core/data/data.service'
import { TranslatorService } from '../../../core/i18n/translator.service'
import { ColumnChartElFocusEvent, ColumnChartEntry } from '../../../diagrams/column-chart/column-chart.component'
import { COLORS_COMPARE } from '../../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
} from '../../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { TooltipService } from '../../../shared/components/tooltip/tooltip.service'
import { adminFormatNum } from '../../../static-utils/admin-format-num.function'
import { formatUtcDate } from '../../../static-utils/date-utils'
import { replaceHyphenWithEnDash } from '../../../static-utils/replace-hyphen-with-en-dash.functions'
import {
  CurrentWrHospCapacityIcuValues,
  WeeklyReportCardHospCapacityIcuComponent,
} from '../weekly-report-card-hosp-capacity-icu.component'

interface CapIcuChartEntry extends ColumnChartEntry {
  diff: number | null
}

interface CapIcuChartData {
  prevDate: Date
  currDate: Date
  relData: CapIcuChartEntry[]
  absData: CapIcuChartEntry[]
}

@Component({
  selector: 'bag-weekly-report-hosp-capacity-icu-chart',
  templateUrl: './weekly-report-hosp-capacity-icu-chart.component.html',
  styleUrls: ['./weekly-report-hosp-capacity-icu-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportHospCapacityIcuChartComponent {
  readonly yLabelFmt = replaceHyphenWithEnDash

  readonly colors = <[string, string]>COLORS_COMPARE
  readonly capIcuData$: Observable<CapIcuChartData> = this.parent.currentValues$.pipe(
    map(this.prepareCapIcuChartData.bind(this)),
  )

  constructor(
    private readonly tooltipService: TooltipService,
    private readonly translator: TranslatorService,
    @Inject(forwardRef(() => WeeklyReportCardHospCapacityIcuComponent))
    private readonly parent: WeeklyReportCardHospCapacityIcuComponent,
  ) {}

  showWeeklyCapTooltip(
    { source, data, direction }: ColumnChartElFocusEvent<CapIcuChartEntry>,
    chartData: CapIcuChartData,
    isRel: boolean,
  ) {
    const toFixed = isRel ? 1 : undefined
    const ctx: TooltipListContentData = {
      title: data.id,
      entries: [
        {
          color: this.colors[0],
          label: this.translator.get('WeeklyReport.WeekFrom', {
            week: getISOWeek(chartData.prevDate),
            date: formatUtcDate(chartData.prevDate),
          }),
          value: adminFormatNum(data.values[0], toFixed, isRel ? '%' : ''),
        },
        {
          color: this.colors[1],
          label: this.translator.get('WeeklyReport.WeekFrom', {
            week: getISOWeek(chartData.currDate),
            date: formatUtcDate(chartData.currDate),
          }),
          value: adminFormatNum(data.values[1], toFixed, isRel ? '%' : ''),
          borderBelow: true,
        },
        {
          label: this.translator.get('WeeklyReport.Difference'),
          value: adminFormatNum(data.diff, 1, isRel ? 'pp' : '%', true),
        },
      ],
    }

    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: direction === 'horizontal' ? 'above' : ['below', 'above'],
      offsetY: 16,
    })
  }

  hideTooltip() {
    this.tooltipService.hide()
  }

  private prepareCapIcuChartData(cv: CurrentWrHospCapacityIcuValues): CapIcuChartData {
    return {
      prevDate: cv.prevWeekStart,
      currDate: cv.currWeekStart,
      relData: this.createCapIcuChartEntries(cv.data, true),
      absData: this.createCapIcuChartEntries(cv.data, false),
    }
  }

  private createCapIcuChartEntries(
    data: WeeklyReportDataPair<WeeklyReportHospCapacityDataCard>,
    isRel: boolean,
  ): CapIcuChartEntry[] {
    const readGdiValueFn = (inlineValue: InlineValues<HospCapacityWeeklyValues>) =>
      isRel ? inlineValue.percentage : inlineValue.week

    const prev = data.prev.geoUnitData[TopLevelGeoUnit.CH]
    const curr = data.curr.geoUnitData[TopLevelGeoUnit.CH]

    return [
      {
        id: this.translator.get('HospCapacity.Card.BedsCovid.Label'),
        values: [readGdiValueFn(prev.HospCapacityCovid), readGdiValueFn(curr.HospCapacityCovid)],
        diff: isRel ? curr.HospCapacityCovid.diffWeekPpPercentage : curr.HospCapacityCovid.diffWeekPercentage,
      },
      {
        id: this.translator.get('HospCapacity.Card.BedsNonCovid.Label'),
        values: [readGdiValueFn(prev.HospCapacityNonCovid), readGdiValueFn(curr.HospCapacityNonCovid)],
        diff: isRel ? curr.HospCapacityNonCovid.diffWeekPpPercentage : curr.HospCapacityNonCovid.diffWeekPercentage,
      },
      {
        id: this.translator.get('HospCapacity.Card.BedsFree.Label'),
        values: [readGdiValueFn(prev.HospCapacityFree), readGdiValueFn(curr.HospCapacityFree)],
        diff: isRel ? curr.HospCapacityFree.diffWeekPpPercentage : curr.HospCapacityFree.diffWeekPercentage,
      },
    ]
  }
}
