import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  GdiVariant,
  isDefined,
  TopLevelGeoUnit,
  VaccinationStatusVaccineDevelopmentData,
  VaccineVaccinationStatus,
} from '@c19/commons'
import { getEnumKeyFromValue, getEnumValues } from '@shiftcode/utilities'
import { addDays } from 'date-fns'
import { combineLatest, merge, Observable } from 'rxjs'
import { map, mapTo, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { HistogramAreaEntry } from '../../../diagrams/histogram/histogram-area/histogram-area.component'
import { HistogramLineEntry } from '../../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../../routes/route-paths.enum'
import {
  COLOR_VACCINE_STATUS_JOHNSON_FULL,
  COLOR_VACCINE_STATUS_MODERNA_FULL,
  COLOR_VACCINE_STATUS_MODERNA_PARTIAL,
  COLOR_VACCINE_STATUS_NOT_VACCINATED,
  COLOR_VACCINE_STATUS_NOT_VACCINATED_MAIN,
  COLOR_VACCINE_STATUS_PFIZER_FULL,
  COLOR_VACCINE_STATUS_PFIZER_PARTIAL,
  COLOR_VACCINE_STATUS_UNKNOWN,
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
  DEFAULT_VACC_VACCINE_STATUS_RELATIVITY_FILTER,
  getInz100KAbsFilterOptions,
  Inz100KAbsFilter,
} from '../../../shared/models/filters/relativity/inz100k-abs-filter.enum'
import {
  DEFAULT_VACC_SATUS_CUMULATIVE_FILTER,
  VaccStatusCumulativeFilter,
  vaccStatusCumulativeFilterOptions,
} from '../../../shared/models/filters/vacc-status-cumulative-filter.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { adminFormatNum } from '../../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../../static-utils/emit-value-to-own-view.function'
import {
  createMultiSelectQueryParamValue,
  filterHistoColors,
  filterHistoLegendPairs,
  MultiSelectValueOption,
  readMultiSelectQueryParamValue,
} from '../../../static-utils/multi-select-filter-utils'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../../static-utils/update-query-param.function'
import { BaseCardVaccStatusComponent, CurrentValuesVaccStatusBase } from '../base-card-vacc-status.component'

interface CurrentValues extends CurrentValuesVaccStatusBase {
  cumulativeFilter: VaccStatusCumulativeFilter
  relativityFilter: Inz100KAbsFilter
  vaccineStatus: VaccineVaccinationStatus[]
}

interface AreaEntry extends HistogramAreaEntry {
  actualValues: (number | null)[]
}

interface VaccineHistogramEntry extends HistogramLineEntry {
  forceHideTooltip?: boolean
  actualValues: (number | null)[]
}

interface PopulationData {
  entries: AreaEntry[]
  legendPairs: Array<[string, string]>
  colors: string[]
}

interface MainChartData {
  lineData: VaccineHistogramEntry[]
  legendPairs: Array<[string, string]>
  colors: string[]
  legendGroupLabel: string | null
  metaKey: string
  skipNoDataBefore: Date | null
  skipNoDataAfter: Date | null
  showNoData?: boolean
  isInz: boolean
}

interface ChartData {
  isRel: boolean
  titleKey: string
  populationData: PopulationData
  mainChartData: MainChartData
}

const DEFAULT_VACCINE_FILTERS = [
  VaccineVaccinationStatus.FULLY_VACCINATED_MODERNA,
  VaccineVaccinationStatus.FULLY_VACCINATED_PFIZER_BIONTECH,
  VaccineVaccinationStatus.FULLY_VACCINATED_JOHNSON_JOHNSON,
  VaccineVaccinationStatus.NOT_VACCINATED,
  VaccineVaccinationStatus.UNKNOWN,
]

@Component({
  selector: 'bag-detail-card-vacc-status-vaccine',
  templateUrl: './detail-card-vacc-status-vaccine.component.html',
  styleUrls: ['./detail-card-vacc-status-vaccine.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVaccStatusVaccineComponent
  extends BaseCardVaccStatusComponent<VaccinationStatusVaccineDevelopmentData>
  implements OnInit
{
  protected cardDetailPath = RoutePaths.SHARE_VACC_VACCINE

  readonly cumulativeFilterOptions = vaccStatusCumulativeFilterOptions(DEFAULT_VACC_SATUS_CUMULATIVE_FILTER)
  readonly cumulativeFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.VACC_STATUS_VACCINE_DEV_CUMULATIVE_FILTER] || null,
  )
  readonly cumulativeFilter$: Observable<VaccStatusCumulativeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACC_STATUS_VACCINE_DEV_CUMULATIVE_FILTER, DEFAULT_VACC_SATUS_CUMULATIVE_FILTER),
    tap<VaccStatusCumulativeFilter>(
      emitValToOwnViewFn(this.cumulativeFilterCtrl, DEFAULT_VACC_SATUS_CUMULATIVE_FILTER),
    ),
  )

  readonly vaccineStatusFilterOptions: MultiSelectValueOption[] = getEnumValues(VaccineVaccinationStatus).map(
    (status): MultiSelectValueOption => ({
      value: status,
      label: this.translator.get(
        `VaccineVaccinationStatusFilter.${getEnumKeyFromValue(VaccineVaccinationStatus, status)}`,
      ),
    }),
  )
  readonly defaultVaccineStatusFilterOptions: MultiSelectValueOption[] = this.vaccineStatusFilterOptions.filter((o) =>
    DEFAULT_VACCINE_FILTERS.includes(<VaccineVaccinationStatus>o.value),
  )
  readonly vaccineStatusFilterCtrl = new FormControl(
    readMultiSelectQueryParamValue(
      [...this.vaccineStatusFilterOptions],
      VaccineVaccinationStatus,
      this.route.snapshot.queryParams[QueryParams.VACC_STATUS_VACCINE],
      this.defaultVaccineStatusFilterOptions,
    ),
  )
  readonly vaccineStatusFilter$: Observable<MultiSelectValueOption[]> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACC_STATUS_VACCINE, null),
    map((v) =>
      readMultiSelectQueryParamValue(
        [...this.vaccineStatusFilterOptions],
        VaccineVaccinationStatus,
        v,
        this.defaultVaccineStatusFilterOptions,
      ),
    ),
    tap<MultiSelectValueOption[]>(emitValToOwnViewFn(this.vaccineStatusFilterCtrl)),
  )

  readonly relativityFilterOptions = getInz100KAbsFilterOptions(DEFAULT_VACC_VACCINE_STATUS_RELATIVITY_FILTER)
  readonly relativityFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.VACC_REL_FILTER] || null)
  readonly relativityFilter$: Observable<Inz100KAbsFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACC_REL_FILTER, DEFAULT_VACC_VACCINE_STATUS_RELATIVITY_FILTER),
    tap<Inz100KAbsFilter>(
      emitValToOwnViewFn(this.vaccDosesRelativityFilterCtrl, DEFAULT_VACC_VACCINE_STATUS_RELATIVITY_FILTER),
    ),
  )

  @Input()
  hideResetBtn: boolean

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.indicatorFilter$,
    this.cumulativeFilter$,
    this.relativityFilter$,
    this.vaccineStatusFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[indicator, cumulativeFilter, relativityFilter, vaccineStatusFilter], geoUnit]) => {
      return {
        indicator,
        cumulativeFilter,
        relativityFilter,
        geoUnit,
        vaccineStatus: <VaccineVaccinationStatus[]>vaccineStatusFilter.map((v) => v.value),
        timeSpan: this.data.timeSpan,
      }
    }),
  )

  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))
  readonly infoKey$ = this.currentValues$.pipe(map(this.prepareInfoKey.bind(this)))

  // data for charts
  readonly chartData$: Observable<ChartData | null> = this.currentValues$.pipe(map(this.prepareChartData.bind(this)))

  readonly fmtPercentage = (val: number): string => `${val}%`

  vaccineStatusMultiSelectFilterLabelFn: (value: MultiSelectValueOption[]) => string = (
    value: MultiSelectValueOption[],
  ) => {
    return value.length === this.vaccineStatusFilterOptions.length
      ? this.translator.get('VaccineVaccinationStatusFilter.AllSelected')
      : this.translator.get('VaccineVaccinationStatusFilter.CountSelected', { count: value.length })
  }

  override ngOnInit() {
    super.ngOnInit()
    merge(
      this.cumulativeFilterCtrl.valueChanges.pipe(
        map((v) => ({ [QueryParams.VACC_STATUS_VACCINE_DEV_CUMULATIVE_FILTER]: v })),
      ),
      this.relativityFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.VACC_REL_FILTER]: v }))),
      this.vaccineStatusFilterCtrl.valueChanges.pipe(
        map((v: MultiSelectValueOption[]) =>
          createMultiSelectQueryParamValue(v, this.defaultVaccineStatusFilterOptions),
        ),
        map((v) => ({ [QueryParams.VACC_STATUS_VACCINE]: v })),
      ),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))
  }

  showHistogramLineTooltip(
    { source, data }: HistogramElFocusEvent<VaccineHistogramEntry>,
    histoLegendPairs: Array<[string, string]>,
    isInz: boolean,
  ) {
    if (data.forceHideTooltip) {
      this.hideTooltip()
      return
    } else if (data.actualValues && data.actualValues.length > 0) {
      this.showHistogramLineTableTooltip({ source, data }, histoLegendPairs, isInz)
    } else {
      const ctx: TooltipListContentData = {
        title: formatUtcDate(data.date),
        entries: data.values
          .map((v, ix) => [histoLegendPairs[ix][0], histoLegendPairs[ix][1], v] as const)
          .sort((a, b) => (b[2] || 0) - (a[2] || 0))
          .map((e) => {
            return {
              label: this.translator.get(e[1]),
              color: e[0],
              value: adminFormatNum(e[2]),
            }
          }),
      }
      this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
        position: ['before', 'after', 'above'],
        offsetX: 16,
        maxWidth: 400,
      })
    }
  }

  showPopulationTooltip(
    { source, data }: HistogramElFocusEvent<AreaEntry>,
    legendPairs: Array<[string, string]>,
    isRel: boolean,
  ) {
    const reversedLegend = [...legendPairs].reverse()
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: reversedLegend.map((lp, index): TooltipListContentEntry => {
        return {
          color: lp[0],
          label: this.translator.get(lp[1]),
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
      isRel: cv.relativityFilter === Inz100KAbsFilter.INZ_100K,
      titleKey: `Vaccination.Status.Card.Vaccine.${this.indicatorKey(cv.indicator)}.Title`,
      populationData: this.preparePopulationData(),
      mainChartData: this.prepareDailyData(cv),
    }
  }

  private preparePopulationData(): PopulationData {
    const entries: AreaEntry[] = this.data.populationValues.map((e): AreaEntry => {
      const modernaFull = e[VaccineVaccinationStatus.FULLY_VACCINATED_MODERNA]?.percentagePopulationTotal
      const pfizerFull = e[VaccineVaccinationStatus.FULLY_VACCINATED_PFIZER_BIONTECH]?.percentagePopulationTotal
      const johnsonFull = e[VaccineVaccinationStatus.FULLY_VACCINATED_JOHNSON_JOHNSON]?.percentagePopulationTotal
      const modernaPartial = e[VaccineVaccinationStatus.PARTIALLY_VACCINATED_MODERNA]?.percentagePopulationTotal
      const pfizerPartial = e[VaccineVaccinationStatus.PARTIALLY_VACCINATED_PFIZER_BIONTECH]?.percentagePopulationTotal
      const notVaccinated = e[VaccineVaccinationStatus.NOT_VACCINATED]?.percentagePopulationTotal

      // calculated values for area chart
      const modernaFullArea = modernaFull || 0
      const pfizerFullArea = (pfizerFull || 0) + modernaFullArea
      const johnsonFullarea = (johnsonFull || 0) + pfizerFullArea
      const modernaPartialArea = (modernaPartial || 0) + johnsonFullarea
      const pfizerPartialArea = (pfizerPartial || 0) + modernaPartialArea
      const notVaccinatedArea = pfizerPartialArea + (notVaccinated || 0)

      return {
        date: parseIsoDate(e.date),
        values: [
          modernaFullArea,
          pfizerFullArea,
          johnsonFullarea,
          modernaPartialArea,
          pfizerPartialArea,
          notVaccinatedArea,
        ],
        actualValues: [
          isDefined(notVaccinated) ? notVaccinated : null,
          isDefined(pfizerPartial) ? pfizerPartial : null,
          isDefined(modernaPartial) ? modernaPartial : null,
          isDefined(johnsonFull) ? johnsonFull : null,
          isDefined(pfizerFull) ? pfizerFull : null,
          isDefined(modernaFull) ? modernaFull : null,
        ],
      }
    })

    return {
      entries,
      colors: [
        COLOR_VACCINE_STATUS_MODERNA_FULL,
        COLOR_VACCINE_STATUS_PFIZER_FULL,
        COLOR_VACCINE_STATUS_JOHNSON_FULL,
        COLOR_VACCINE_STATUS_MODERNA_PARTIAL,
        COLOR_VACCINE_STATUS_PFIZER_PARTIAL,
        COLOR_VACCINE_STATUS_NOT_VACCINATED,
      ],
      legendPairs: [
        [COLOR_VACCINE_STATUS_MODERNA_FULL, 'Vaccination.Status.Card.Vaccine.ModernaFull'],
        [COLOR_VACCINE_STATUS_PFIZER_FULL, 'Vaccination.Status.Card.Vaccine.PfizerFull'],
        [COLOR_VACCINE_STATUS_JOHNSON_FULL, 'Vaccination.Status.Card.Vaccine.JohnsonFull'],
        [COLOR_VACCINE_STATUS_MODERNA_PARTIAL, 'Vaccination.Status.Card.Vaccine.ModernaPartial'],
        [COLOR_VACCINE_STATUS_PFIZER_PARTIAL, 'Vaccination.Status.Card.Vaccine.PfizerPartial'],
        [COLOR_VACCINE_STATUS_NOT_VACCINATED, 'Vaccination.Status.Card.Vaccine.NotVaccinated'],
      ],
    }
  }

  private prepareDailyData(cv: CurrentValues): MainChartData {
    const vaccinationStatusKeys = cv.vaccineStatus.length
      ? cv.vaccineStatus
      : <VaccineVaccinationStatus[]>getEnumValues(VaccineVaccinationStatus)

    let legendGroupLabel: string | null = null
    let skipNoDataBefore: Date | null = null
    let skipNoDataAfter: Date | null = null

    const isInz = cv.relativityFilter === Inz100KAbsFilter.INZ_100K
    const isTotal = cv.cumulativeFilter === VaccStatusCumulativeFilter.TOTAL

    const relevantGdi: GdiVariant.ROLLMEAN_7D | GdiVariant.INZ_ROLLMEAN_7D | GdiVariant.TOTAL | GdiVariant.INZ_TOTAL =
      isInz
        ? isTotal
          ? GdiVariant.INZ_TOTAL
          : GdiVariant.INZ_ROLLMEAN_7D
        : isTotal
        ? GdiVariant.TOTAL
        : GdiVariant.ROLLMEAN_7D

    let secondaryGdi: GdiVariant.VALUE | GdiVariant.INZ

    if (!isTotal) {
      secondaryGdi = isInz ? GdiVariant.INZ : GdiVariant.VALUE
    }

    // colors and legend pairs
    const colors: string[] = filterHistoColors(
      [
        COLOR_VACCINE_STATUS_MODERNA_FULL,
        COLOR_VACCINE_STATUS_PFIZER_FULL,
        COLOR_VACCINE_STATUS_JOHNSON_FULL,
        COLOR_VACCINE_STATUS_MODERNA_PARTIAL,
        COLOR_VACCINE_STATUS_PFIZER_PARTIAL,
        COLOR_VACCINE_STATUS_NOT_VACCINATED_MAIN,
        COLOR_VACCINE_STATUS_UNKNOWN,
      ],
      cv.vaccineStatus,
      VaccineVaccinationStatus,
    )

    const legendPairs: Array<[string, string]> = filterHistoLegendPairs(
      colors,
      cv.vaccineStatus,
      VaccineVaccinationStatus,
    )
      .reverse()
      .map((pair) => {
        pair[1] = `VaccineVaccinationStatusFilter.${getEnumKeyFromValue(VaccineVaccinationStatus, pair[1])}`
        return pair
      })

    const isInzTotal = isInz && cv.cumulativeFilter === VaccStatusCumulativeFilter.TOTAL

    // show no data for inz total
    if (isInzTotal) {
      const lineDataEmpty: VaccineHistogramEntry[] = [
        {
          date: parseIsoDate(this.data.timeSpan.start),
          values: [],
          actualValues: [],
        },
        {
          date: parseIsoDate(this.data.timeSpan.end),
          values: [],
          actualValues: [],
        },
      ]
      return {
        lineData: lineDataEmpty,
        colors,
        legendPairs,
        legendGroupLabel,
        metaKey: this.prepareChartLabel(cv),
        skipNoDataAfter,
        skipNoDataBefore,
        showNoData: true,
        isInz,
      }
    }

    const lineData: VaccineHistogramEntry[] = this.data.values[cv.indicator].map((rec): VaccineHistogramEntry => {
      return {
        date: parseIsoDate(rec.date),
        values: vaccinationStatusKeys.map((status) => rec[status][relevantGdi]),
        actualValues: secondaryGdi ? vaccinationStatusKeys.map((status) => rec[status][secondaryGdi]) : [],
      }
    })

    if (cv.cumulativeFilter === VaccStatusCumulativeFilter.DAILY) {
      legendGroupLabel = this.translator.get('Vaccination.Status.Card.7dAverage')
      skipNoDataBefore = addDays(lineData[0].date, 3)
      skipNoDataAfter = addDays(lineData[lineData.length - 1].date, -3)
    }

    return {
      lineData,
      colors,
      legendPairs,
      legendGroupLabel,
      metaKey: this.prepareChartLabel(cv),
      skipNoDataAfter,
      skipNoDataBefore,
      isInz,
    }
  }

  private prepareChartLabel(cv: CurrentValues) {
    const indicator = this.indicatorKey(cv.indicator)
    switch (cv.relativityFilter) {
      case Inz100KAbsFilter.INZ_100K:
        return `Vaccination.Status.Card.Chart.Meta.${indicator}.Inz`
      case Inz100KAbsFilter.ABSOLUTE:
        return `Vaccination.Status.Card.Chart.Meta.${indicator}.Abs`
    }
  }

  private prepareInfoKey(cv: CurrentValues): string {
    return `Vaccination.Status.Card.Vaccine.${this.indicatorKey(cv.indicator)}.Info`
  }

  private showHistogramLineTableTooltip(
    { source, data }: HistogramElFocusEvent<VaccineHistogramEntry>,
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
        .sort((a, b) => (b[2] || 0) - (a[2] || 0))
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
}
