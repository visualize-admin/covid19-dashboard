import { BreakpointObserver } from '@angular/cdk/layout'
import { ChangeDetectionStrategy, Component, forwardRef, Inject, ViewEncapsulation } from '@angular/core'
import { createKeyValueMap, GdiVariant } from '@c19/commons'
import { pascalCase } from 'change-case'
import { getISOWeek } from 'date-fns'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { TranslatorService } from '../../../../core/i18n/translator.service'
import {
  ColumnChartDirection,
  ColumnChartElFocusEvent,
  ColumnChartEntry,
} from '../../../../diagrams/column-chart/column-chart.component'
import { COLORS_COMPARE } from '../../../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
} from '../../../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { TooltipService } from '../../../../shared/components/tooltip/tooltip.service'
import { adminFormatNum } from '../../../../static-utils/admin-format-num.function'
import { Breakpoints } from '../../../../static-utils/breakpoints.enum'
import { formatUtcDate } from '../../../../static-utils/date-utils'
import { replaceHyphenWithEnDash } from '../../../../static-utils/replace-hyphen-with-en-dash.functions'
import {
  CurrentWrDemographyValues,
  WeeklyReportCardDemographyComponent,
} from '../../weekly-report-card-demography.component'

interface DemoAgeChartEntry extends ColumnChartEntry {
  diff: number | null
}

interface DemoSexChartEntry extends DemoAgeChartEntry {
  absValues: (number | null)[]
}

interface DemoChartData {
  prevDate: Date
  currDate: Date
  absData: DemoAgeChartEntry[]
  inzData: DemoAgeChartEntry[]
  sexData: DemoSexChartEntry[]
}

@Component({
  selector: 'bag-weekly-report-demo-chart',
  templateUrl: './weekly-report-demo-chart.component.html',
  styleUrls: ['./weekly-report-demo-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportDemoChartComponent {
  readonly yLabelFmt = replaceHyphenWithEnDash

  readonly colors = <[string, string]>COLORS_COMPARE
  readonly demoData$: Observable<DemoChartData> = this.parent.currentValues$.pipe(
    map(this.prepareDemoChartData.bind(this)),
  )

  readonly direction$: Observable<ColumnChartDirection> = this.breakpointObserver
    .observe(`(max-width: ${Breakpoints.MAX_MD}px)`)
    .pipe(map((state) => (state.matches ? 'vertical' : 'horizontal')))

  constructor(
    private tooltipService: TooltipService,
    private translator: TranslatorService,
    private breakpointObserver: BreakpointObserver,
    @Inject(forwardRef(() => WeeklyReportCardDemographyComponent)) readonly parent: WeeklyReportCardDemographyComponent,
  ) {}

  showAgeTooltip(
    { source, data, direction }: ColumnChartElFocusEvent<DemoAgeChartEntry>,
    chartData: DemoChartData,
    isRel: boolean,
  ) {
    const toFixed = isRel ? 2 : undefined
    const ctx: TooltipListContentData = {
      title: this.translator.get('WeeklyReport.Card.Demography.AgeGroupX', {
        ageGroup: replaceHyphenWithEnDash(data.id),
      }),
      entries: [
        {
          color: this.colors[0],
          label: this.translator.get('WeeklyReport.WeekFrom', {
            week: getISOWeek(chartData.prevDate),
            date: formatUtcDate(chartData.prevDate),
          }),
          value: adminFormatNum(data.values[0], toFixed),
        },
        {
          color: this.colors[1],
          label: this.translator.get('WeeklyReport.WeekFrom', {
            week: getISOWeek(chartData.currDate),
            date: formatUtcDate(chartData.currDate),
          }),
          value: adminFormatNum(data.values[1], toFixed),
          borderBelow: true,
        },
        {
          label: this.translator.get('WeeklyReport.Difference'),
          value: adminFormatNum(data.diff, 1, '%', true),
        },
      ],
    }

    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: direction === 'horizontal' ? 'above' : ['below', 'above'],
      offsetY: 16,
    })
  }

  showSexTooltip({ source, data, direction }: ColumnChartElFocusEvent<DemoSexChartEntry>, chartData: DemoChartData) {
    const ctx: TooltipListContentData = {
      title: data.id,
      entries: [
        {
          color: this.colors[0],
          label: this.translator.get('WeeklyReport.WeekFrom', {
            week: getISOWeek(chartData.prevDate),
            date: formatUtcDate(chartData.prevDate),
          }),
          value: adminFormatNum(data.values[0], 1, '%'),
        },
        {
          color: this.colors[1],
          label: this.translator.get('WeeklyReport.WeekFrom', {
            week: getISOWeek(chartData.currDate),
            date: formatUtcDate(chartData.currDate),
          }),
          value: adminFormatNum(data.values[1], 1, '%'),
          borderBelow: true,
        },
        {
          label: this.translator.get('WeeklyReport.Difference'),
          value: adminFormatNum(data.diff, 1, 'pp', true),
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

  private prepareDemoChartData(cv: CurrentWrDemographyValues): DemoChartData {
    return {
      prevDate: cv.prevWeekStart,
      currDate: cv.currWeekStart,
      absData: this.createAgeChartEntries(cv, GdiVariant.WEEK),
      inzData: this.createAgeChartEntries(cv, GdiVariant.INZ_WEEK),
      sexData: this.createGenderChartEntries(cv),
    }
  }

  private createAgeChartEntries(
    cv: CurrentWrDemographyValues,
    prop: GdiVariant.WEEK | GdiVariant.INZ_WEEK,
  ): DemoAgeChartEntry[] {
    const ageW2Map = createKeyValueMap(cv.ageData.curr, (v) => v.bucket)
    return cv.ageData.prev
      .map((bw1) => [bw1, ageW2Map[bw1.bucket]])
      .map(
        ([bw1, bw2]): DemoAgeChartEntry => ({
          id: bw1.bucket,
          values: [bw1[prop], bw2[prop]],
          diff: bw2.diffWeekPercentage,
        }),
      )
      .reverse()
  }

  private createGenderChartEntries(cv: CurrentWrDemographyValues): DemoSexChartEntry[] {
    const sexW2Map = createKeyValueMap(cv.genderData.curr, (v) => v.bucket)
    return cv.genderData.prev
      .map((bw1) => [bw1, sexW2Map[bw1.bucket]])
      .map(
        ([bw1, bw2]): DemoSexChartEntry => ({
          id: this.translator.get(`Commons.${pascalCase(bw1.bucket)}`),
          values: [bw1.percentage, bw2.percentage],
          diff: bw2.diffPpPercentage,
          absValues: [bw1.week, bw2.week],
        }),
      )
  }
}
