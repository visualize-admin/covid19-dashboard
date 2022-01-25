import { BreakpointObserver } from '@angular/cdk/layout'
import { ChangeDetectionStrategy, Component, forwardRef, Inject, ViewEncapsulation } from '@angular/core'
import {
  CantonGeoUnit,
  GdiSubset,
  GeoUnit,
  isDefined,
  SwissRegionGeoUnit,
  TopLevelGeoUnit,
  WeeklyPositivityRateData,
  WeeklyReportPositivityRateGeographyCard,
} from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { getISOWeek } from 'date-fns'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { TranslatorService } from '../../../../core/i18n/translator.service'
import {
  ColumnChartDirection,
  ColumnChartElFocusEvent,
  ColumnChartEntry,
} from '../../../../diagrams/column-chart/column-chart.component'
import { COLORS_COMPARE, COLORS_COMPARE_REF } from '../../../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
} from '../../../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { TooltipService } from '../../../../shared/components/tooltip/tooltip.service'
import { RegionsFilter } from '../../../../shared/models/filters/regions-filter.enum'
import { adminFormatNum } from '../../../../static-utils/admin-format-num.function'
import { Breakpoints } from '../../../../static-utils/breakpoints.enum'
import { formatUtcDate } from '../../../../static-utils/date-utils'
import {
  CurrentWrTestPosValues,
  WeeklyReportCardTestPositivityComponent,
} from '../../weekly-report-card-test-positivity.component'

interface TestPosChartEntry extends ColumnChartEntry {
  diff: number | null
}

interface WeeklyReportTestposChartViewData {
  prevDate: Date
  currDate: Date

  pcrEntries: TestPosChartEntry[] | null
  pcrRefValues: [number | null, number | null]

  antigenEntries: TestPosChartEntry[] | null
  antigenRefValues: [number | null, number | null]

  forCantons: boolean
}

@Component({
  selector: 'bag-weekly-report-testpos-chart',
  templateUrl: './weekly-report-testpos-chart.component.html',
  styleUrls: ['./weekly-report-testpos-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportTestposChartComponent {
  readonly colors = <[string, string]>COLORS_COMPARE
  readonly refColors = <[string, string]>COLORS_COMPARE_REF

  readonly viewData$: Observable<WeeklyReportTestposChartViewData> = this.parent.currentValues$.pipe(
    map(this.prepareViewData.bind(this)),
  )

  readonly direction$: Observable<ColumnChartDirection> = combineLatest([
    this.breakpointObserver.observe(`(max-width: ${Breakpoints.MAX_MD}px)`),
    this.parent.currentValues$,
  ]).pipe(
    map(([state, cv]) =>
      cv.regionsFilter !== RegionsFilter.GREATER_REGIONS && state.matches ? 'vertical' : 'horizontal',
    ),
  )

  constructor(
    private tooltipService: TooltipService,
    private translator: TranslatorService,
    private breakpointObserver: BreakpointObserver,
    @Inject(forwardRef(() => WeeklyReportCardTestPositivityComponent))
    readonly parent: WeeklyReportCardTestPositivityComponent,
  ) {}

  showTooltip(
    { source, data, direction }: ColumnChartElFocusEvent<TestPosChartEntry>,
    viewData: WeeklyReportTestposChartViewData,
  ) {
    const ctx: TooltipListContentData = {
      title: viewData.forCantons ? this.translator.get(`GeoFilter.${data.id}`) : data.id,
      entries: [
        {
          color: this.colors[0],
          label: this.translator.get('WeeklyReport.WeekFrom', {
            week: getISOWeek(viewData.prevDate),
            date: formatUtcDate(viewData.prevDate),
          }),
          value: adminFormatNum(data.values[0], 1, '%'),
        },
        {
          color: this.colors[1],
          label: this.translator.get('WeeklyReport.WeekFrom', {
            week: getISOWeek(viewData.currDate),
            date: formatUtcDate(viewData.currDate),
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

  private prepareViewData(cv: CurrentWrTestPosValues): WeeklyReportTestposChartViewData {
    const forCantons = cv.regionsFilter === RegionsFilter.CANTONS
    const grRegions = <SwissRegionGeoUnit[]>getEnumValues(SwissRegionGeoUnit)
    const cantons = <CantonGeoUnit[]>getEnumValues(CantonGeoUnit)

    // we know that no ids are equal, so we skip a.id===b.id -> 0
    const sortCantonEntry = (a: TestPosChartEntry, b: TestPosChartEntry) =>
      a.id === CantonGeoUnit.FL ? 1 : a.id < b.id ? -1 : 1

    const pcrEntries = forCantons
      ? this.mapChartEntries(cantons, cv.prevWeek, cv.currWeek, GdiSubset.TEST_PCR, false).sort(sortCantonEntry)
      : this.mapChartEntries(grRegions, cv.prevWeek, cv.currWeek, GdiSubset.TEST_PCR, true)

    const antigenEntries = forCantons
      ? this.mapChartEntries(cantons, cv.prevWeek, cv.currWeek, GdiSubset.TEST_ANTIGEN, false).sort(sortCantonEntry)
      : this.mapChartEntries(grRegions, cv.prevWeek, cv.currWeek, GdiSubset.TEST_ANTIGEN, true)

    const prevChfl = cv.prevWeek.geoUnitData[TopLevelGeoUnit.CHFL]
    const currChfl = cv.currWeek.geoUnitData[TopLevelGeoUnit.CHFL]

    return {
      prevDate: cv.prevWeekStart,
      currDate: cv.currWeekStart,
      pcrEntries: pcrEntries.some((e) => e.values.some(isDefined)) ? pcrEntries : null,
      pcrRefValues: [
        prevChfl ? prevChfl[GdiSubset.TEST_PCR].percentageWeek_posTest : null,
        currChfl ? currChfl[GdiSubset.TEST_PCR].percentageWeek_posTest : null,
      ],
      antigenEntries: antigenEntries.some((e) => e.values.some(isDefined)) ? antigenEntries : null,
      antigenRefValues: [
        prevChfl ? prevChfl[GdiSubset.TEST_ANTIGEN].percentageWeek_posTest : null,
        currChfl ? currChfl[GdiSubset.TEST_ANTIGEN].percentageWeek_posTest : null,
      ],
      forCantons,
    }
  }

  private mapChartEntries(
    entries: GeoUnit[],
    dataPrev: WeeklyReportPositivityRateGeographyCard,
    dataCurr: WeeklyReportPositivityRateGeographyCard,
    context: keyof WeeklyPositivityRateData,
    translateGeoUnit = false,
  ): TestPosChartEntry[] {
    return entries.map((geoUnit): TestPosChartEntry => {
      const prev = dataPrev.geoUnitData[geoUnit]
      const curr = dataCurr.geoUnitData[geoUnit]
      return {
        id: translateGeoUnit ? this.translator.get(`GeoFilter.${geoUnit}`) : geoUnit,
        values: [
          prev ? prev[context].percentageWeek_posTest : null,
          curr ? curr[context].percentageWeek_posTest : null,
        ],
        diff: curr ? curr[context].diffPpPercentageWeek_posTest : null,
      }
    })
  }
}
