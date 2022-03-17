import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { TopLevelGeoUnit, VaccinationStatus, VaccinationStatusDevelopmentData } from '@c19/commons'
import { addDays } from 'date-fns'
import { combineLatest, merge, Observable } from 'rxjs'
import { map, mapTo, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { HistogramAreaEntry } from '../../../diagrams/histogram/histogram-area/histogram-area.component'
import { HistogramDetailEntry } from '../../../diagrams/histogram/histogram-detail/histogram-detail.component'
import { HistogramLineEntry } from '../../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../../routes/route-paths.enum'
import {
  COLOR_PRIMARY,
  COLOR_STATUS_LINE_FULL,
  COLOR_STATUS_LINE_FULL_WITH_BOOSTER,
  COLOR_STATUS_LINE_NOT_VACCINATED,
  COLOR_STATUS_LINE_PARTIAL,
  COLOR_STATUS_LINE_UNKNOWN,
  COLOR_STATUS_NOT_VACCINATED,
  COLOR_VACC_PERSONS_FULL,
  COLOR_VACC_PERSONS_PARTIAL,
} from '../../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import {
  TooltipTableContentComponent,
  TooltipTableContentData,
} from '../../../shared/components/tooltip/tooltip-table-content/tooltip-table-content.component'
import {
  DEFAULT_DEVELOPMENT_VIEW_FILTER,
  DevelopmentViewFilter,
  getDevelopmentViewFilterOptions,
} from '../../../shared/models/filters/development-view-filter.enum'
import {
  DEFAULT_DEVELOPMENT_VIEW_TOTAL_FILTER,
  DevelopmentViewTotalFilter,
  getDevelopmentViewTotalFilterOptions,
} from '../../../shared/models/filters/development-view-total-filter.enum'
import {
  DEFAULT_VACC_SATUS_CUMULATIVE_FILTER,
  VaccStatusCumulativeFilter,
  vaccStatusCumulativeFilterOptions,
} from '../../../shared/models/filters/vacc-status-cumulative-filter.enum'
import {
  DEFAULT_VACC_STATUS_DEVELOPMENT_RELATIVITY_FILTER,
  getInz100AbsRelFilterOptions,
  Inz100AbsRelFilter,
} from '../../../shared/models/filters/relativity/inz100-abs-rel-filter.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { adminFormatNum } from '../../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../../static-utils/update-query-param.function'
import { BaseCardVaccStatusComponent, CurrentValuesVaccStatusBase } from '../base-card-vacc-status.component'

interface CurrentValues extends CurrentValuesVaccStatusBase {
  cumulativeFilter: VaccStatusCumulativeFilter
  developmentViewFilter: DevelopmentViewFilter
  developmentViewTotalFilter: DevelopmentViewTotalFilter
  relativityFilter: Inz100AbsRelFilter
}

interface AreaEntry extends HistogramAreaEntry {
  actualValues: (number | null)[]
}

interface PopulationData {
  entries: AreaEntry[]
  legendPairs: Array<[string, string, boolean]>
  colors: string[]
}

interface DailyHistogramLineEntry extends HistogramLineEntry {
  actualValues: (number | null)[]
}

interface DailyHistogramDetailEntry extends HistogramDetailEntry {
  actualValues: (number | null)[]
}

interface DailyData {
  lineData: DailyHistogramLineEntry[] | null
  barData: DailyHistogramDetailEntry[] | null
  legendPairs: Array<[string, string]>
  colors: string[]
  metaKey: string
  skipNoDataBefore: Date | null
  skipNoDataAfter: Date | null
  isInz: boolean
}

interface TotalData {
  lineData: HistogramLineEntry[] | null
  areaData: AreaEntry[] | null
  legendPairs: Array<[string, string, boolean]>
  colors: string[]
  metaKey: string
  showNoData?: boolean
}

interface ChartData {
  isRel: boolean
  isInz: boolean
  isTotal: boolean
  titleKey: string
  completenessData: HistogramDetailEntry[]
  populationData: PopulationData
  dailyData: DailyData | null
  totalData: TotalData | null
}

@Component({
  selector: 'bag-detail-card-vacc-status-development',
  templateUrl: './detail-card-vacc-status-development.component.html',
  styleUrls: ['./detail-card-vacc-status-development.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVaccStatusDevelopmentComponent
  extends BaseCardVaccStatusComponent<VaccinationStatusDevelopmentData>
  implements OnInit
{
  protected cardDetailPath = RoutePaths.SHARE_DEVELOPMENT

  readonly colorCompleteness = COLOR_PRIMARY

  readonly cumulativeFilterOptions = vaccStatusCumulativeFilterOptions(DEFAULT_VACC_SATUS_CUMULATIVE_FILTER)
  readonly cumulativeFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.DEV_CUMULATIVE_FILTER] || null,
  )
  readonly cumulativeFilter$: Observable<VaccStatusCumulativeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEV_CUMULATIVE_FILTER, DEFAULT_VACC_SATUS_CUMULATIVE_FILTER),
    tap<VaccStatusCumulativeFilter>(
      emitValToOwnViewFn(this.cumulativeFilterCtrl, DEFAULT_VACC_SATUS_CUMULATIVE_FILTER),
    ),
  )

  readonly developmentViewFilterOptions = getDevelopmentViewFilterOptions(DEFAULT_DEVELOPMENT_VIEW_FILTER)
  readonly developmentViewFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.DEVELOPMENT_VIEW_FILTER] || null,
  )
  readonly developmentViewFilter$: Observable<DevelopmentViewFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEVELOPMENT_VIEW_FILTER, DEFAULT_DEVELOPMENT_VIEW_FILTER),
    tap<DevelopmentViewFilter>(emitValToOwnViewFn(this.developmentViewFilterCtrl, DEFAULT_DEVELOPMENT_VIEW_FILTER)),
  )

  readonly developmentViewTotalFilterOptions = getDevelopmentViewTotalFilterOptions(
    DEFAULT_DEVELOPMENT_VIEW_TOTAL_FILTER,
  )
  readonly developmentViewTotalFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.DEVELOPMENT_VIEW_TOTAL_FILTER] || null,
  )
  readonly developmentViewTotalFilter$: Observable<DevelopmentViewTotalFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEVELOPMENT_VIEW_TOTAL_FILTER, DEFAULT_DEVELOPMENT_VIEW_TOTAL_FILTER),
    tap<DevelopmentViewTotalFilter>(
      emitValToOwnViewFn(this.developmentViewTotalFilterCtrl, DEFAULT_DEVELOPMENT_VIEW_TOTAL_FILTER),
    ),
  )

  readonly relativityFilterOptions = getInz100AbsRelFilterOptions(DEFAULT_VACC_STATUS_DEVELOPMENT_RELATIVITY_FILTER)
  readonly relativityFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.VACC_STATUS_DEV_REL_FILTER] || null,
  )
  readonly relativityFilter$: Observable<Inz100AbsRelFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACC_STATUS_DEV_REL_FILTER, DEFAULT_VACC_STATUS_DEVELOPMENT_RELATIVITY_FILTER),
    tap<Inz100AbsRelFilter>(
      emitValToOwnViewFn(this.relativityFilterCtrl, DEFAULT_VACC_STATUS_DEVELOPMENT_RELATIVITY_FILTER),
    ),
  )

  @Input()
  hideResetBtn: boolean

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.indicatorFilter$,
    this.cumulativeFilter$,
    this.developmentViewFilter$,
    this.developmentViewTotalFilter$,
    this.relativityFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(
      ([
        [indicator, cumulativeFilter, developmentViewFilter, developmentViewTotalFilter, relativityFilter],
        geoUnit,
      ]) => {
        return {
          indicator,
          cumulativeFilter,
          developmentViewFilter,
          developmentViewTotalFilter,
          relativityFilter,
          geoUnit,
          timeSpan: this.data.timeSpan,
        }
      },
    ),
  )

  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))
  readonly infoKey$ = this.currentValues$.pipe(map(this.prepareInfoKey.bind(this)))

  // data for charts
  readonly chartData$: Observable<ChartData | null> = this.currentValues$.pipe(map(this.prepareChartData.bind(this)))

  readonly fmtPercentage = (val: number): string => `${val}%`

  override ngOnInit() {
    super.ngOnInit()
    merge(
      this.cumulativeFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.DEV_CUMULATIVE_FILTER]: v }))),
      this.developmentViewFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.DEVELOPMENT_VIEW_FILTER]: v }))),
      this.developmentViewTotalFilterCtrl.valueChanges.pipe(
        map((v) => ({ [QueryParams.DEVELOPMENT_VIEW_TOTAL_FILTER]: v })),
      ),
      this.relativityFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.VACC_STATUS_DEV_REL_FILTER]: v }))),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))
  }

  showHistogramLineTooltip(
    { source, data }: HistogramElFocusEvent<HistogramLineEntry>,
    histoLegendPairs: Array<[string, string, boolean]>,
  ) {
    const ctx: TooltipListContentData = {
      entries: data.values
        .map((v, ix) => [histoLegendPairs[ix][0], histoLegendPairs[ix][1], v] as const)
        .sort((a, b) => (b[2] || 0) - (a[2] || 0))
        .map((e) => {
          return {
            label: this.translator.get(e[1]),
            value: adminFormatNum(e[2]),
            color: e[0],
          }
        }),
      title: formatUtcDate(data.date),
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  showHistogramLineTableTooltip(
    { source, data }: HistogramElFocusEvent<DailyHistogramLineEntry>,
    histoLegendPairs: Array<[string, string]>,
    isInz: boolean,
  ) {
    const ctx: TooltipTableContentData = {
      col1Key: 'Vaccination.Status.Card.Development.Daily.Tooltip.Mean',
      col1Bold: true,
      col2Key: 'Vaccination.Status.Card.Development.Daily.Tooltip.Value',
      col2Bold: false,
      entries: data.values
        .map((v, ix) => [histoLegendPairs[ix][0], histoLegendPairs[ix][1], v, data.actualValues[ix]] as const)
        .sort((a, b) => (b[3] || 0) - (a[3] || 0))
        .map((e) => {
          return {
            key: e[1],
            col1: { color: e[0], value: adminFormatNum(e[2], 2) },
            col2: { value: adminFormatNum(e[3], isInz ? 2 : undefined) },
          }
        }),
      title: formatUtcDate(data.date),
    }
    this.tooltipService.showCmp(TooltipTableContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  showHistogramDetailToolTip(
    { source, data }: HistogramElFocusEvent<DailyHistogramDetailEntry>,
    histoLegendPairs: Array<[string, string]>,
    isRel: boolean,
  ) {
    if (data.actualValues && data.actualValues.length) {
      const ctx: TooltipTableContentData = {
        col1Key: 'Vaccination.Status.Card.Development.Daily.Tooltip.Mean',
        col1Bold: true,
        col2Key: 'Vaccination.Status.Card.Development.Daily.Tooltip.Value',
        col2Bold: false,
        entries: data.barValues
          .map((v, ix) => [histoLegendPairs[ix][0], histoLegendPairs[ix][1], v, data.actualValues[ix]] as const)
          .reverse()
          .map((e) => {
            return {
              key: e[1],
              col1: {
                color: e[0],
                type: 'square',
                value: adminFormatNum(e[2], 2, isRel ? '%' : undefined),
              },
              col2: { value: adminFormatNum(e[3], isRel ? 2 : undefined, isRel ? '%' : undefined) },
            }
          }),
        title: formatUtcDate(data.date),
      }
      this.tooltipService.showCmp(TooltipTableContentComponent, source, ctx, {
        position: ['above'],
        offsetY: 16,
      })
    } else {
      const ctx: TooltipListContentData = {
        entries: data.barValues
          .map((v, ix) => {
            return {
              label: this.translator.get(histoLegendPairs[ix][1]),
              value: adminFormatNum(v, isRel ? 2 : undefined, isRel ? '%' : undefined),
              color: histoLegendPairs[ix][0],
            }
          })
          .reverse(),
        title: formatUtcDate(data.date),
      }
      this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
        position: ['above'],
        offsetY: 16,
      })
    }
  }

  showCompletenessTooltip({ source, data }: HistogramElFocusEvent<HistogramDetailEntry>) {
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: [
        {
          color: this.colorCompleteness,
          value: adminFormatNum(data.barValues[0], 2, '%'),
          label: this.translator.get('Vaccination.Status.Card.Development.Chart.Completeness.Tooltip'),
        },
      ],
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['above'],
      offsetY: 16,
    })
  }

  showPopulationTooltip(
    { source, data }: HistogramElFocusEvent<AreaEntry>,
    legendPairs: Array<[string, string, boolean]>,
    isRel: boolean,
  ) {
    const reversedLegend = [...legendPairs].reverse()
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: reversedLegend.map((lp, index): TooltipListContentEntry => {
        return {
          color: lp[0],
          label: this.translator.get(lp[1]),
          pattern: lp[2],
          value: adminFormatNum(data.actualValues[index], isRel ? 2 : undefined, isRel ? '%' : undefined),
        }
      }),
    }

    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  private prepareChartData(cv: CurrentValues): ChartData | null {
    if (cv.geoUnit !== TopLevelGeoUnit.CHFL) {
      return null
    }
    return {
      isRel: cv.relativityFilter === Inz100AbsRelFilter.RELATIVE,
      isInz: cv.relativityFilter === Inz100AbsRelFilter.INZ_100,
      isTotal: cv.cumulativeFilter === VaccStatusCumulativeFilter.TOTAL,
      titleKey: `Vaccination.Status.Card.${this.indicatorKey(cv.indicator)}.Title`,
      completenessData: this.prepareCompletenessData(cv),
      populationData: this.preparePopulationData(),
      dailyData: this.prepareDailyData(cv),
      totalData: this.prepareTotalData(cv),
    }
  }

  private prepareCompletenessData(cv: CurrentValues): HistogramDetailEntry[] {
    return this.data.completenessValues[cv.indicator].map((v): HistogramDetailEntry => {
      return {
        date: parseIsoDate(v.date),
        barValues: [v.completeness],
        lineValues: [],
      }
    })
  }

  private preparePopulationData(): PopulationData {
    const entries: AreaEntry[] = this.data.populationValues.map((e) => {
      const full = e[VaccinationStatus.FULLY_VACCINATED].percentagePopulationTotal
      const partial = e[VaccinationStatus.PARTIALLY_VACCINATED].percentagePopulationTotal
      const notVaccinated = e[VaccinationStatus.NOT_VACCINATED].percentagePopulationTotal
      const booster = e[VaccinationStatus.FULLY_VACCINATED_FIRST_BOOSTER].percentagePopulationTotal

      // calculated values for area chart
      const fullArea = full || 0
      const partialArea = (partial || 0) + fullArea
      const notVaccinatedArea = partialArea + (notVaccinated || 0)
      return {
        date: parseIsoDate(e.date),
        values: [booster, fullArea, partialArea, notVaccinatedArea],
        actualValues: [notVaccinated, partial, full, booster],
      }
    })

    return {
      entries,
      colors: ['url(#patternDots)', COLOR_VACC_PERSONS_FULL, COLOR_VACC_PERSONS_PARTIAL, COLOR_STATUS_NOT_VACCINATED],
      legendPairs: [
        [COLOR_VACC_PERSONS_FULL, 'Vaccination.Status.Card.WithBooster', true],
        [COLOR_VACC_PERSONS_FULL, 'Vaccination.Status.Card.FullyVaccinated', false],
        [COLOR_VACC_PERSONS_PARTIAL, 'Vaccination.Status.Card.PartiallyVaccinated', false],
        [COLOR_STATUS_NOT_VACCINATED, 'Vaccination.Status.Card.NotVaccinated', false],
      ],
    }
  }

  private prepareDailyData(cv: CurrentValues): DailyData | null {
    if (cv.cumulativeFilter !== VaccStatusCumulativeFilter.DAILY) {
      return null
    }

    let lineData: DailyHistogramLineEntry[] | null = null
    let barData: DailyHistogramDetailEntry[] | null = null

    let colors: string[] = []
    let legendPairs: Array<[string, string]> = []

    let skipNoDataBefore: Date | null = null
    let skipNoDataAfter: Date | null = null

    const isInz = cv.relativityFilter === Inz100AbsRelFilter.INZ_100

    // colors and legend pairs
    colors = [
      COLOR_STATUS_LINE_FULL_WITH_BOOSTER,
      COLOR_STATUS_LINE_FULL,
      COLOR_STATUS_LINE_PARTIAL,
      COLOR_STATUS_LINE_NOT_VACCINATED,
    ]
    legendPairs = [
      [COLOR_STATUS_LINE_FULL_WITH_BOOSTER, 'Vaccination.Status.Card.FullyVaccinatedFirstBooster'],
      [COLOR_STATUS_LINE_FULL, 'Vaccination.Status.Card.FullyVaccinatedNoBooster'],
      [COLOR_STATUS_LINE_PARTIAL, 'Vaccination.Status.Card.PartiallyVaccinated'],
      [COLOR_STATUS_LINE_NOT_VACCINATED, 'Vaccination.Status.Card.NotVaccinated'],
    ]
    if (!isInz) {
      colors.push(COLOR_STATUS_LINE_UNKNOWN)
      legendPairs.push([COLOR_STATUS_LINE_UNKNOWN, 'Vaccination.Status.Card.Unknown'])
    }

    if (cv.relativityFilter !== Inz100AbsRelFilter.RELATIVE) {
      lineData = this.data.values[cv.indicator].map((v): DailyHistogramLineEntry => {
        const fullyNoBooster = v[VaccinationStatus.FULLY_VACCINATED_NO_BOOSTER]
        const fullyWithBooster = v[VaccinationStatus.FULLY_VACCINATED_FIRST_BOOSTER]
        const partially = v[VaccinationStatus.PARTIALLY_VACCINATED]
        const notVaccinated = v[VaccinationStatus.NOT_VACCINATED]
        const unknown = v[VaccinationStatus.UNKNOWN]

        return {
          date: parseIsoDate(v.date),
          values: isInz
            ? [
                fullyWithBooster.inzRollmean7d,
                fullyNoBooster.inzRollmean7d,
                partially.inzRollmean7d,
                notVaccinated.inzRollmean7d,
              ]
            : [
                fullyWithBooster.rollmean7d,
                fullyNoBooster.rollmean7d,
                partially.rollmean7d,
                notVaccinated.rollmean7d,
                unknown.rollmean7d,
              ],
          actualValues: isInz
            ? [fullyWithBooster.inz, fullyNoBooster.inz, partially.inz, notVaccinated.inz]
            : [fullyWithBooster.value, fullyNoBooster.value, partially.value, notVaccinated.value, unknown.value],
        }
      })

      skipNoDataBefore = addDays(lineData[0].date, 3)
      skipNoDataAfter = addDays(lineData[lineData.length - 1].date, -3)
    } else if (cv.relativityFilter === Inz100AbsRelFilter.RELATIVE) {
      barData = this.data.values[cv.indicator].map((v): DailyHistogramDetailEntry => {
        const fullyNoBooster = v[VaccinationStatus.FULLY_VACCINATED_NO_BOOSTER]
        const fullyWithBooster = v[VaccinationStatus.FULLY_VACCINATED_FIRST_BOOSTER]
        const partially = v[VaccinationStatus.PARTIALLY_VACCINATED]
        const notVaccinated = v[VaccinationStatus.NOT_VACCINATED]
        const unknown = v[VaccinationStatus.UNKNOWN]

        return {
          date: parseIsoDate(v.date),
          barValues: [
            fullyWithBooster.percentageRollmean7d,
            fullyNoBooster.percentageRollmean7d,
            partially.percentageRollmean7d,
            notVaccinated.percentageRollmean7d,
            unknown.percentageRollmean7d,
          ],
          actualValues: [
            fullyWithBooster.percentage,
            fullyNoBooster.percentage,
            partially.percentage,
            notVaccinated.percentage,
            unknown.percentage,
          ],
          lineValues: [],
        }
      })
      skipNoDataBefore = addDays(barData[0].date, 3)
      skipNoDataAfter = addDays(barData[barData.length - 1].date, -3)
      colors[0] = COLOR_STATUS_LINE_FULL_WITH_BOOSTER
      legendPairs[0] = [COLOR_STATUS_LINE_FULL_WITH_BOOSTER, 'Vaccination.Status.Card.FullyVaccinatedFirstBooster']
    }

    return {
      lineData,
      barData,
      colors,
      legendPairs,
      skipNoDataAfter,
      skipNoDataBefore,
      metaKey: this.prepareChartLabel(cv),
      isInz: cv.relativityFilter === Inz100AbsRelFilter.INZ_100,
    }
  }

  private prepareTotalData(cv: CurrentValues): TotalData | null {
    if (cv.cumulativeFilter !== VaccStatusCumulativeFilter.TOTAL) {
      return null
    }

    let lineData: HistogramLineEntry[] | null = null
    let areaData: AreaEntry[] | null = null
    let colors: string[] = []
    let legendPairs: Array<[string, string, boolean]> = []

    const isInz = false

    // colors and legend pairs
    colors = [
      COLOR_STATUS_LINE_FULL_WITH_BOOSTER,
      COLOR_STATUS_LINE_FULL,
      COLOR_STATUS_LINE_PARTIAL,
      COLOR_STATUS_LINE_NOT_VACCINATED,
    ]
    legendPairs = [
      [COLOR_STATUS_LINE_FULL_WITH_BOOSTER, 'Vaccination.Status.Card.FullyVaccinatedFirstBooster', false],
      [COLOR_STATUS_LINE_FULL, 'Vaccination.Status.Card.FullyVaccinatedNoBooster', false],
      [COLOR_STATUS_LINE_PARTIAL, 'Vaccination.Status.Card.PartiallyVaccinated', false],
      [COLOR_STATUS_LINE_NOT_VACCINATED, 'Vaccination.Status.Card.NotVaccinated', false],
    ]
    if (!isInz) {
      colors.push(COLOR_STATUS_LINE_UNKNOWN)
      legendPairs.push([COLOR_STATUS_LINE_UNKNOWN, 'Vaccination.Status.Card.Unknown', false])
    }

    // no inz_100 for total for now
    if (cv.relativityFilter === Inz100AbsRelFilter.INZ_100) {
      lineData = [
        {
          date: parseIsoDate(this.data.timeSpan.start),
          values: [],
        },
        {
          date: parseIsoDate(this.data.timeSpan.end),
          values: [],
        },
      ]
      return {
        lineData,
        areaData,
        colors,
        legendPairs,
        metaKey: this.prepareChartLabel(cv),
        showNoData: true,
      }
    }

    if (cv.relativityFilter !== Inz100AbsRelFilter.RELATIVE) {
      // chart data
      if (cv.developmentViewTotalFilter === DevelopmentViewTotalFilter.LINES) {
        lineData = this.data.values[cv.indicator].map((v): HistogramLineEntry => {
          const fullyNoBooster = v[VaccinationStatus.FULLY_VACCINATED_NO_BOOSTER]
          const fullyWithBooster = v[VaccinationStatus.FULLY_VACCINATED_FIRST_BOOSTER]
          const partially = v[VaccinationStatus.PARTIALLY_VACCINATED]
          const notVaccinated = v[VaccinationStatus.NOT_VACCINATED]
          const unknown = v[VaccinationStatus.UNKNOWN]

          return {
            date: parseIsoDate(v.date),
            values: isInz
              ? [fullyWithBooster.inzTotal, fullyNoBooster.inzTotal, partially.inzTotal, notVaccinated.inzTotal]
              : [fullyWithBooster.total, fullyNoBooster.total, partially.total, notVaccinated.total, unknown.total],
          }
        })
      }
      if (cv.developmentViewTotalFilter === DevelopmentViewTotalFilter.AREAS) {
        areaData = this.data.values[cv.indicator].map((v): AreaEntry => {
          const fully = isInz
            ? v[VaccinationStatus.FULLY_VACCINATED].inzTotal
            : v[VaccinationStatus.FULLY_VACCINATED].total
          const fullyNoBooster = isInz
            ? v[VaccinationStatus.FULLY_VACCINATED_NO_BOOSTER].inzTotal
            : v[VaccinationStatus.FULLY_VACCINATED_NO_BOOSTER].total
          const fullyWithBooster = isInz
            ? v[VaccinationStatus.FULLY_VACCINATED_FIRST_BOOSTER].inzTotal
            : v[VaccinationStatus.FULLY_VACCINATED_FIRST_BOOSTER].total

          const partially = isInz
            ? v[VaccinationStatus.PARTIALLY_VACCINATED].inzTotal
            : v[VaccinationStatus.PARTIALLY_VACCINATED].total
          const notVaccinated = isInz
            ? v[VaccinationStatus.NOT_VACCINATED].inzTotal
            : v[VaccinationStatus.NOT_VACCINATED].total
          const unknown = isInz ? v[VaccinationStatus.UNKNOWN].inzTotal : v[VaccinationStatus.UNKNOWN].total

          // calculated values for area chart
          const fullArea = fully || 0
          const partialArea = (partially || 0) + fullArea
          const notVaccinatedArea = partialArea + (notVaccinated || 0)
          const unknownArea = notVaccinatedArea + (unknown || 0)

          return {
            date: parseIsoDate(v.date),
            values: isInz
              ? [fullyWithBooster, fullArea, partialArea, notVaccinatedArea]
              : [fullyWithBooster, fullArea, partialArea, notVaccinatedArea, unknownArea],
            actualValues: isInz
              ? [notVaccinated, partially, fullyNoBooster, fullyWithBooster]
              : [unknown, notVaccinated, partially, fullyNoBooster, fullyWithBooster],
          }
        })
      }
    } else if (cv.relativityFilter === Inz100AbsRelFilter.RELATIVE) {
      areaData = this.data.values[cv.indicator].map((v): AreaEntry => {
        const fullyNoBooster = v[VaccinationStatus.FULLY_VACCINATED_NO_BOOSTER].percentageTotal
        const fullyWithBooster = v[VaccinationStatus.FULLY_VACCINATED_FIRST_BOOSTER].percentageTotal

        const partially = v[VaccinationStatus.PARTIALLY_VACCINATED].percentageTotal
        const notVaccinated = v[VaccinationStatus.NOT_VACCINATED].percentageTotal
        const unknown = v[VaccinationStatus.UNKNOWN].percentageTotal

        // calculated values for area chart
        const fullBoosterArea = fullyWithBooster || 0
        const fullArea = fullBoosterArea + (fullyNoBooster || 0)
        const partialArea = (partially || 0) + fullArea
        const notVaccinatedArea = partialArea + (notVaccinated || 0)
        const unknownArea = notVaccinatedArea + (unknown || 0)

        return {
          date: parseIsoDate(v.date),
          values: [fullBoosterArea, fullArea, partialArea, notVaccinatedArea, unknownArea],
          actualValues: [unknown, notVaccinated, partially, fullyNoBooster, fullyWithBooster],
        }
      })
    }

    return {
      lineData,
      areaData,
      colors,
      legendPairs,
      metaKey: this.prepareChartLabel(cv),
    }
  }

  private prepareChartLabel(cv: CurrentValues) {
    const indicator = this.indicatorKey(cv.indicator)

    switch (cv.relativityFilter) {
      case Inz100AbsRelFilter.INZ_100:
        return `Vaccination.Status.Card.Chart.Meta.${indicator}.Inz`
      case Inz100AbsRelFilter.ABSOLUTE:
        return `Vaccination.Status.Card.Chart.Meta.${indicator}.Abs`
      case Inz100AbsRelFilter.RELATIVE:
        return `Vaccination.Status.Card.Chart.Meta.${indicator}.Rel`
    }
  }

  private prepareInfoKey(cv: CurrentValues): string {
    return `Vaccination.Status.Card.Development.${this.indicatorKey(cv.indicator)}.Info`
  }
}
