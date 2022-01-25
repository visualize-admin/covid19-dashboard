import { BreakpointObserver } from '@angular/cdk/layout'
import { ChangeDetectionStrategy, Component, forwardRef, Inject, ViewEncapsulation } from '@angular/core'
import {
  CantonGeoUnit,
  GdiVariant,
  GeoUnit,
  SwissRegionGeoUnit,
  TopLevelGeoUnit,
  WeeklyReportEpidemiologicGeographyCard,
  WeeklyValues,
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
import { CurrentWrGeoValues, WeeklyReportCardGeographyComponent } from '../../weekly-report-card-geography.component'

interface ComparisonChartEntry extends ColumnChartEntry {
  diff: number | null
}

interface WeeklyReportGeoChartViewData {
  prevDate: Date
  currDate: Date
  absData: ComparisonChartEntry[]
  inzData: ComparisonChartEntry[]
  refValues: [number | null, number | null]
  rotateXAxisLabels: boolean
  translateId: boolean
}

@Component({
  selector: 'bag-weekly-report-geo-chart',
  templateUrl: './weekly-report-geo-chart.component.html',
  styleUrls: ['./weekly-report-geo-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportGeoChartComponent {
  readonly viewData$: Observable<WeeklyReportGeoChartViewData> = this.parent.currentValues$.pipe(
    map(this.prepareViewData.bind(this)),
  )
  readonly colors = <[string, string]>COLORS_COMPARE
  readonly refColors = <[string, string]>COLORS_COMPARE_REF

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
    @Inject(forwardRef(() => WeeklyReportCardGeographyComponent)) readonly parent: WeeklyReportCardGeographyComponent,
  ) {}

  showTooltip(
    { source, data, direction }: ColumnChartElFocusEvent<ComparisonChartEntry>,
    viewData: WeeklyReportGeoChartViewData,
    isInz: boolean,
  ) {
    const toFixed = isInz ? 2 : undefined
    const ctx: TooltipListContentData = {
      title: viewData.translateId ? this.translator.get(`GeoFilter.${data.id}`) : data.id,
      entries: [
        {
          color: this.colors[0],
          label: this.translator.get('WeeklyReport.WeekFrom', {
            week: getISOWeek(viewData.prevDate),
            date: formatUtcDate(viewData.prevDate),
          }),
          value: adminFormatNum(data.values[0], toFixed),
        },
        {
          color: this.colors[1],
          label: this.translator.get('WeeklyReport.WeekFrom', {
            week: getISOWeek(viewData.currDate),
            date: formatUtcDate(viewData.currDate),
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

  hideTooltip() {
    this.tooltipService.hide()
  }

  private prepareViewData(cv: CurrentWrGeoValues): WeeklyReportGeoChartViewData {
    const forCantons = cv.regionsFilter === RegionsFilter.CANTONS
    const grRegions = <SwissRegionGeoUnit[]>getEnumValues(SwissRegionGeoUnit)
    const cantons = <CantonGeoUnit[]>getEnumValues(CantonGeoUnit)

    // we know that no ids are equal, so we skip a.id===b.id -> 0
    const sortCantonEntry = (a: ComparisonChartEntry, b: ComparisonChartEntry) =>
      a.id === CantonGeoUnit.FL ? 1 : a.id < b.id ? -1 : 1

    const absData = forCantons
      ? this.mapChartData(cantons, cv.prevWeek, cv.currWeek, GdiVariant.WEEK, false).sort(sortCantonEntry)
      : this.mapChartData(grRegions, cv.prevWeek, cv.currWeek, GdiVariant.WEEK, true)

    const inzData = forCantons
      ? this.mapChartData(cantons, cv.prevWeek, cv.currWeek, GdiVariant.INZ_WEEK, false).sort(sortCantonEntry)
      : this.mapChartData(grRegions, cv.prevWeek, cv.currWeek, GdiVariant.INZ_WEEK, true)

    const refValues: [number | null, number | null] = [
      cv.prevWeek.geoUnitData[TopLevelGeoUnit.CHFL].inzWeek,
      cv.currWeek.geoUnitData[TopLevelGeoUnit.CHFL].inzWeek,
    ]

    return {
      prevDate: cv.prevWeekStart,
      currDate: cv.currWeekStart,
      absData,
      inzData,
      refValues,
      rotateXAxisLabels: cv.regionsFilter === RegionsFilter.GREATER_REGIONS,
      translateId: cv.regionsFilter !== RegionsFilter.GREATER_REGIONS,
    }
  }

  private mapChartData(
    entries: GeoUnit[],
    dataPrev: WeeklyReportEpidemiologicGeographyCard,
    dataCurr: WeeklyReportEpidemiologicGeographyCard,
    propName: WeeklyValues,
    translateGeoUnit: boolean,
  ): ComparisonChartEntry[] {
    return entries.map((geoUnit) => {
      return {
        id: translateGeoUnit ? this.translator.get(`GeoFilter.${geoUnit}`) : geoUnit,
        values: [dataPrev.geoUnitData[geoUnit][propName], dataCurr.geoUnitData[geoUnit][propName]],
        diff: dataCurr.geoUnitData[geoUnit].diffWeekPercentage,
      }
    })
  }
}
