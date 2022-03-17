import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  EpidemiologicVaccPersonsVaccineDevelopmentData,
  EpidemiologicVaccVaccineDevelopmentEntry,
  EpidemiologicVaccVaccineTimelineEntry,
  GdiSubset,
  GdiVariant,
  GeoUnit,
  isDefined,
  TopLevelGeoUnit,
  VaccinationVaccine,
  VaccinationVaccineGroups,
  VaccinationVaccineInvidual,
} from '@c19/commons'
import { getEnumKeyFromValue, getEnumValues } from '@shiftcode/utilities'
import { addDays, differenceInDays } from 'date-fns'
import { combineLatest, merge, Observable } from 'rxjs'
import {
  distinctUntilChanged,
  map,
  mapTo,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators'
import { HistogramDetailEntry } from '../../diagrams/histogram/histogram-detail/histogram-detail.component'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLOR_PER_VACCINE, COLORS_VACC_HEATMAP } from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import {
  TooltipTableContentComponent,
  TooltipTableContentData,
  TooltipTableContentEntry,
} from '../../shared/components/tooltip/tooltip-table-content/tooltip-table-content.component'
import { RelAbsFilter } from '../../shared/models/filters/relativity/rel-abs-filter.enum'
import {
  DEFAULT_VACC_VACCINE_CUMULATIVE_FILTER,
  getVaccVaccineCumulativeFilterOptions,
  VaccVaccineCumulativeFilter,
} from '../../shared/models/filters/vacc-vaccine-cumulative-filter.enum'

import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { deepEqual } from '../../static-utils/deep-equal.function'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import {
  createMultiSelectQueryParamValue,
  MultiSelectValueOption,
  readMultiSelectQueryParamValue,
} from '../../static-utils/multi-select-filter-utils'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import {
  BaseDetailCardVaccinationComponent,
  CurrentValuesVaccinationBase,
} from '../base-detail-card-vaccination.component'

interface CurrentValues extends CurrentValuesVaccinationBase {
  cumulativeFilter: VaccVaccineCumulativeFilter
  isRel: boolean
  vaccines: VaccinationVaccineInvidual[]
}

interface VaccineData {
  dailyData: DailyChartData | null
  cumulativeData: CumulativeChartData | null
  isRel: boolean
  histoColors: string[]
  histoLegendPairs: [string, string][]

  showCumulative: boolean
  showDailyValues: boolean
}

interface DailyHistogramDetailEntry extends HistogramDetailEntry {
  totalEntry: DailyTotalEntry | null
  entries: Array<{
    color: string
    key: string
    mean: number | null
    value: number | null
  }>
}

interface DailyChartData {
  entries: DailyHistogramDetailEntry[]
  lineThickness: number[]
  skipNoDataBefore: Date
  noData: boolean
}

interface CumulativeChartData {
  entries: HistogramLineEntry[]
  hasNullValues: boolean
}

type TempValueEntry = [
  EpidemiologicVaccVaccineDevelopmentEntry,
  Record<VaccinationVaccine, EpidemiologicVaccVaccineTimelineEntry>,
]

interface DailyTotalEntry {
  mean: number | null
  value: number | null
}

@Component({
  selector: 'bag-detail-card-vacc-persons-vaccine',
  templateUrl: './detail-card-vacc-persons-vaccine.component.html',
  styleUrls: ['./detail-card-vacc-persons-vaccine.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVaccPersonsVaccineComponent
  extends BaseDetailCardVaccinationComponent<EpidemiologicVaccPersonsVaccineDevelopmentData>
  implements OnInit
{
  @Input()
  hideResetBtn: boolean

  readonly cardDetailPath = RoutePaths.SHARE_VACC_VACCINE
  readonly heatmapScaleColors = COLORS_VACC_HEATMAP

  readonly cumulativeCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.VACCINE_CUMULATIVE_FILTER])
  readonly cumulativeFilterOptions = getVaccVaccineCumulativeFilterOptions(DEFAULT_VACC_VACCINE_CUMULATIVE_FILTER)
  readonly cumulativeFilter$: Observable<VaccVaccineCumulativeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACCINE_CUMULATIVE_FILTER, DEFAULT_VACC_VACCINE_CUMULATIVE_FILTER),
    tap<VaccVaccineCumulativeFilter>(emitValToOwnViewFn(this.cumulativeCtrl, DEFAULT_VACC_VACCINE_CUMULATIVE_FILTER)),
  )

  // order is important: JOHNSON_JOHNSON needs to be first
  readonly vaccineFilterOptions: MultiSelectValueOption[] = [
    {
      value: VaccinationVaccineInvidual.JOHNSON_JOHNSON,
      label: this.translator.get(`VaccVaccine.JOHNSON_JOHNSON`),
    },
    {
      value: VaccinationVaccineInvidual.PFIZER_BIONTECH,
      label: this.translator.get(`VaccVaccine.PFIZER_BIONTECH`),
    },
    {
      value: VaccinationVaccineInvidual.MODERNA,
      label: this.translator.get(`VaccVaccine.MODERNA`),
    },
  ]

  readonly vaccineFilterCtrl = new FormControl(
    readMultiSelectQueryParamValue(
      [...this.vaccineFilterOptions],
      VaccinationVaccineInvidual,
      this.route.snapshot.queryParams[QueryParams.VACCINE_VIEW_VACCINE_FILTER],
    ),
  )
  readonly vaccineFilter$: Observable<MultiSelectValueOption[]> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACCINE_VIEW_VACCINE_FILTER, null),
    map((v) => readMultiSelectQueryParamValue([...this.vaccineFilterOptions], VaccinationVaccineInvidual, v)),
    tap<MultiSelectValueOption[]>(emitValToOwnViewFn(this.vaccineFilterCtrl)),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.vaccPersonsRelativityFilter$,
    this.cumulativeFilter$,
    this.vaccineFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[relativityFilter, cumulativeFilter, vaccineFilter], geoUnit]) => {
      const isRel = relativityFilter === RelAbsFilter.RELATIVE
      return {
        geoUnit,
        isRel,
        cumulativeFilter,
        vaccines: <VaccinationVaccineInvidual[]>vaccineFilter.map((v) => v.value),
        timeSpan: this.data.timeSpan,
      }
    }),
    distinctUntilChanged(deepEqual),
    shareReplay(1),
  )
  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))

  readonly vaccineData$ = this.currentValues$.pipe(map(this.prepareChartData.bind(this)))

  keys: Record<'info' | 'descriptionTitle' | 'metaRel' | 'metaAbs' | 'legendZero', string>

  override ngOnInit() {
    super.ngOnInit()
    merge(
      this.cumulativeCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.VACCINE_CUMULATIVE_FILTER]: v }))),
      this.vaccineFilterCtrl.valueChanges.pipe(
        map((v: MultiSelectValueOption[]) => createMultiSelectQueryParamValue(v, this.vaccineFilterOptions)),
        map((v) => ({ [QueryParams.VACCINE_VIEW_VACCINE_FILTER]: v })),
      ),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))
  }

  readonly yLabelFmt = (val: number) => `${val}%`

  vaccineMultiSelectFilterLabelFn: (value: MultiSelectValueOption[]) => string = (value: MultiSelectValueOption[]) => {
    return value.length === this.vaccineFilterOptions.length
      ? this.translator.get('VaccVaccineFilter.AllSelected')
      : this.translator.get('VaccVaccineFilter.CountSelected', { count: value.length })
  }

  override resetToChFl() {
    updateQueryParamsFn(this.router)({ [QueryParams.GEO_FILTER]: null })
  }

  showCumulTooltip(
    { source, data }: HistogramElFocusEvent<HistogramLineEntry>,
    isRel: boolean,
    histoLegendPairs: [string, string][],
  ) {
    const noData = !data.values.some(isDefined)
    const ctx: TooltipListContentData = {
      entries: data.values
        .map((v, ix) => [histoLegendPairs[ix][0], histoLegendPairs[ix][1], v] as const)
        .sort((a, b) => (b[2] || 0) - (a[2] || 0))
        .filter((e) => isDefined(e[2]))
        .map((e) => {
          return {
            label: e[1],
            value: adminFormatNum(e[2], isRel ? 2 : undefined, isRel ? '%' : undefined),
            color: e[0],
          }
        }),
      noData,
      title: formatUtcDate(data.date),
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  showDailyTooltip({ source, data }: HistogramElFocusEvent<DailyHistogramDetailEntry>, isRel: boolean) {
    const suffix = isRel ? '%' : ''
    const ctx: TooltipTableContentData = {
      title: data.date,
      col1Key: 'Vaccination.Card.Vaccine.Daily.Tooltip.Mean',
      col1Bold: true,
      col2Key: 'Vaccination.Card.Vaccine.Daily.Tooltip.Value',
      col2Bold: true,
      entries: data.entries
        .filter((v) => isDefined(v.value))
        .map(
          (v): TooltipTableContentEntry => ({
            key: v.key,
            col1: { color: v.color, value: adminFormatNum(v.mean, 2, suffix) },
            col2: { color: v.color, value: adminFormatNum(v.value, isRel ? 2 : undefined, suffix) },
          }),
        ),
    }
    if (data.totalEntry) {
      ctx.footer = [
        {
          key: 'Vaccination.Card.Vaccine.Daily.Tooltip.Total',
          col1: { value: adminFormatNum(data.totalEntry.mean, 2, suffix) },
          col2: { value: adminFormatNum(data.totalEntry.value, isRel ? 2 : undefined, suffix) },
        },
      ]
    }

    this.tooltipService.showCmp(TooltipTableContentComponent, source, ctx, {
      position: ['above', 'before', 'after'],
      offsetX: 16,
      offsetY: 12,
    })
  }

  protected init() {
    this.keys = {
      info: 'Vaccination.VaccPersonsFull.Card.Vaccine.Info',
      descriptionTitle: 'Vaccination.VaccPersonsFull.DetailTitle',
      metaRel: 'Vaccination.VaccPersons.Card.Vaccine.Legend.Rel',
      metaAbs: 'Vaccination.VaccPersons.Card.Vaccine.Legend.Abs',
      legendZero: 'Commons.NoData',
    }
  }

  protected override prepareDescription({ geoUnit }: { geoUnit: GeoUnit }): string {
    const parts = [this.translator.get(this.keys.descriptionTitle), this.translator.get(`GeoFilter.${geoUnit}`)]
    const { start, end } = this.data.timeSpan
    if (start && end) {
      const f = (d: string) => formatUtcDate(parseIsoDate(d))
      parts.push(this.translator.get('Commons.DateToDate', { date1: f(start), date2: f(end) }))
    }
    return parts.join(', ')
  }

  private prepareChartData(cv: CurrentValues): VaccineData | null {
    if (cv.geoUnit !== TopLevelGeoUnit.CHFL) {
      return null
    }
    const tempValueEntries: TempValueEntry[] = this.data.values.map((v) => [v, v[GdiSubset.VACC_PERSONS_FULL]])

    const timeSpanStart = parseIsoDate(this.data.timeSpan.start)
    const dayDiff = differenceInDays(parseIsoDate(tempValueEntries[0][0].date), timeSpanStart)

    const histoLegendPairs = cv.vaccines.map((vaccine): [string, string] => [
      COLOR_PER_VACCINE[vaccine],
      this.translator.get(`VaccVaccine.${getEnumKeyFromValue(VaccinationVaccineInvidual, vaccine)}`),
    ])

    const showDailyValues = tempValueEntries.some(([_, e]) =>
      (<VaccinationVaccineInvidual[]>getEnumValues(VaccinationVaccineInvidual)).some((vaccine) =>
        isDefined(e[vaccine][GdiVariant.VALUE]),
      ),
    )

    return {
      isRel: cv.isRel,
      histoColors: cv.vaccines.map((vaccine) => COLOR_PER_VACCINE[vaccine]),
      histoLegendPairs,
      dailyData: this.transformToDailyData(tempValueEntries, cv, timeSpanStart, dayDiff),
      cumulativeData: this.transformToCumulativeData(tempValueEntries, cv, timeSpanStart, dayDiff),
      showCumulative: cv.cumulativeFilter === VaccVaccineCumulativeFilter.TOTAL,
      showDailyValues: cv.cumulativeFilter === VaccVaccineCumulativeFilter.DAILY && showDailyValues,
    }
  }

  private transformToCumulativeData(
    values: TempValueEntry[],
    cv: CurrentValues,
    timeSpanStart: Date,
    dayDiff: number,
  ): CumulativeChartData | null {
    if (cv.cumulativeFilter !== VaccVaccineCumulativeFilter.TOTAL) {
      return null
    }
    const relevantGdi = cv.isRel ? GdiVariant.INZ_TOTAL : GdiVariant.TOTAL
    const vaccineKeys = cv.vaccines.length
      ? cv.vaccines
      : <VaccinationVaccineInvidual[]>getEnumValues(VaccinationVaccineInvidual)

    const entries: HistogramLineEntry[] = values.map(([e, rec]) => ({
      date: parseIsoDate(e.date),
      values: vaccineKeys.map((vaccine) => rec[vaccine][relevantGdi]),
    }))

    const startPadEntries: HistogramLineEntry[] =
      dayDiff < 1 ? [] : new Array(dayDiff).fill(0).map((_, ix) => ({ date: addDays(timeSpanStart, ix), values: [] }))

    return {
      entries: [...startPadEntries, ...entries],
      hasNullValues: entries.some((e) => !e.values.some(isDefined)),
    }
  }

  private transformToDailyData(
    values: TempValueEntry[],
    cv: CurrentValues,
    timeSpanStart: Date,
    dayDiff: number,
  ): DailyChartData | null {
    if (cv.cumulativeFilter !== VaccVaccineCumulativeFilter.DAILY) {
      return null
    }
    const relevantBarGdi = cv.isRel ? GdiVariant.INZ : GdiVariant.VALUE
    const relevantLineGdi = cv.isRel ? GdiVariant.INZ_ROLLMEAN_7D : GdiVariant.ROLLMEAN_7D
    const vaccineKeys = cv.vaccines.length
      ? cv.vaccines
      : <VaccinationVaccineInvidual[]>getEnumValues(VaccinationVaccineInvidual)

    const showTotalEntry = vaccineKeys.length === getEnumValues(VaccinationVaccineInvidual).length

    const mappedEntries = values.map(([e, rec]): DailyHistogramDetailEntry => {
      const lineValuesSummed: Array<number | null> = []

      vaccineKeys
        .map((vaccine) => rec[vaccine][relevantLineGdi])
        .reduce((a, b) => {
          const sum = a === null && b === null ? null : b === null || b === 0 ? 0 : (a || 0) + (b || 0)

          lineValuesSummed.push(sum)
          return sum
        }, null)
      return {
        date: parseIsoDate(e.date),
        barValues: vaccineKeys.map((vaccine) => rec[vaccine][relevantBarGdi]),
        lineValues: lineValuesSummed,

        totalEntry:
          showTotalEntry && rec[VaccinationVaccineGroups.ALL]
            ? {
                mean: rec[VaccinationVaccineGroups.ALL][relevantLineGdi],
                value: rec[VaccinationVaccineGroups.ALL][relevantBarGdi],
              }
            : null,
        entries: vaccineKeys.map((vaccine) => ({
          color: COLOR_PER_VACCINE[vaccine],
          key: `VaccVaccine.${getEnumKeyFromValue(VaccinationVaccineInvidual, vaccine)}`,
          mean: rec[vaccine][relevantLineGdi],
          value: rec[vaccine][relevantBarGdi],
        })),
      }
    })

    const startPadEntries: DailyHistogramDetailEntry[] =
      dayDiff < 1
        ? []
        : new Array(dayDiff).fill(0).map(
            (_, ix): DailyHistogramDetailEntry => ({
              date: addDays(timeSpanStart, ix),
              totalEntry: null,
              barValues: [],
              lineValues: [],
              entries: [],
            }),
          )

    // if one value is null, set all values to null
    const entries = mappedEntries.map((entry) =>
      entry.barValues.some((v) => v === null) ? { ...entry, values: vaccineKeys.map((_) => null) } : entry,
    )

    return mappedEntries.length
      ? {
          entries: [...startPadEntries, ...entries],
          skipNoDataBefore: addDays(entries[0].date, dayDiff),
          lineThickness: vaccineKeys.map((_) => 2),
          noData: entries.some((e) => !e.barValues.every(isDefined)),
        }
      : null
  }
}
