import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
  DefaultBucketValue,
  GdiObject,
  GdiSubset,
  HospReasonAgeRangeData,
  HospReasonsAgeBucketData,
  HospReasonsAgeRangeValues,
} from '@c19/commons'
import { addDays } from 'date-fns'
import { combineLatest, merge, Observable } from 'rxjs'
import { map, mapTo, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { TranslatorService } from '../../core/i18n/translator.service'
import { UriService } from '../../core/uri.service'
import { HistogramDetailEntry } from '../../diagrams/histogram/histogram-detail/histogram-detail.component'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_HOSP_CAUSE_COVID,
  COLOR_HOSP_CAUSE_OTHER,
  COLOR_HOSP_CAUSE_UNKNOWN,
} from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import {
  DEFAULT_HOSP_CAUSE_PERSONS_AGE_FILTER,
  getHospCausePersonAgeFilterOptions,
  HospCausePersonAgeFilter,
} from '../../shared/models/filters/hosp-cause-person-age-filter.enum'
import {
  DEFAULT_ABS_INZ100K_SHARE_FILTER,
  getInz100KAbsRelFilterOptions,
  Inz100KAbsRelFilter,
} from '../../shared/models/filters/relativity/inz100k-abs-rel-filter.enum'
import { timeSlotFilterTimeFrameKey } from '../../shared/models/filters/time-slot-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { getTimeslotCorrespondingWeeklyValues } from '../../static-utils/data-utils'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { filterBucketData } from '../../static-utils/multi-select-filter-utils'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { BaseDetailEpidemiologicCardComponent, CurrentValuesBase } from '../base-detail-epidemiologic-card.component'

interface CurrentValues extends CurrentValuesBase {
  chartData: HospReasonsAgeBucketData[]
  relativityFilter: Inz100KAbsRelFilter
  personsAgeFilter: HospCausePersonAgeFilter
}

interface HospCauseHistogramLineEntry extends HistogramLineEntry {
  startDate: Date | null
}

interface HospCauseHistogramBarEntry extends HistogramDetailEntry {
  startDate: Date
}

interface ChartData {
  legendPairs: Array<[string, string]>
  colors: string[]
  lineData: HospCauseHistogramLineEntry[] | null
  lineSkipNoDataBefore: Date | null
  barData: HospCauseHistogramBarEntry[] | null
  isInz: boolean
  isRel: boolean
}

interface HistogramPartDef {
  legendKey: string
  tooltipKey: string
  color: string
  gdiSubset: GdiSubset.HOSP_REASON_COVID | GdiSubset.HOSP_REASON_OTHER | GdiSubset.HOSP_REASON_UNKNOWN
}

interface TooltipEntry {
  key: string
  value: number | null
  color: string
}

@Component({
  selector: 'bag-detail-card-epidemiologic-hosp-cause',
  templateUrl: './detail-card-epidemiologic-hosp-cause.component.html',
  styleUrls: ['./detail-card-epidemiologic-hosp-cause.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardEpidemiologicHospCauseComponent extends BaseDetailEpidemiologicCardComponent<HospReasonAgeRangeData> {
  protected initCard(topic: string, gdiObject: GdiObject) {
    this.infoKey = 'DetailCardHospCause.InfoText'
    this.titleKey = 'DetailCardHospCause.Title'
    this.topicKey = 'DetailHosp.Title'
  }

  readonly cardDetailPath = RoutePaths.SHARE_HOSP_CAUSE

  readonly personsAgeFilterOptions = getHospCausePersonAgeFilterOptions(DEFAULT_HOSP_CAUSE_PERSONS_AGE_FILTER)
  readonly personsAgeFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.EPI_AGE_HOSP_CAUSE_FILTER],
  )
  readonly personsAgeFilter$: Observable<HospCausePersonAgeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.EPI_AGE_HOSP_CAUSE_FILTER, DEFAULT_HOSP_CAUSE_PERSONS_AGE_FILTER),
    tap<HospCausePersonAgeFilter>(emitValToOwnViewFn(this.personsAgeFilterCtrl, DEFAULT_HOSP_CAUSE_PERSONS_AGE_FILTER)),
  )

  readonly relativityFilterOptions = getInz100KAbsRelFilterOptions(DEFAULT_ABS_INZ100K_SHARE_FILTER)
  readonly relativityFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.EPI_REL_ABS_HOSP_CAUSE_FILTER] || null,
  )
  readonly relFilter$: Observable<Inz100KAbsRelFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.EPI_REL_ABS_HOSP_CAUSE_FILTER, DEFAULT_ABS_INZ100K_SHARE_FILTER),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.timeFilter$,
    this.relFilter$,
    this.personsAgeFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[timeFilter, relativityFilter, ageFilter], geoUnit]): CurrentValues => {
      const timeFrame = this.data.timeframes[timeSlotFilterTimeFrameKey[timeFilter]]
      return {
        geoUnit,
        timeFilter,
        relativityFilter,
        timeFrame,
        personsAgeFilter: ageFilter,
        chartData: getTimeslotCorrespondingWeeklyValues(this.data.values, timeFrame),
      }
    }),
    shareReplay(1),
  )

  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))
  readonly chartData$ = this.currentValues$.pipe(map(this.prepareChart.bind(this)))

  readonly chartDefinition: HistogramPartDef[] = [
    {
      color: COLOR_HOSP_CAUSE_COVID,
      legendKey: 'DetailCardHospCause.Legend.Covid',
      tooltipKey: 'DetailCardHospCause.Legend.Covid',
      gdiSubset: GdiSubset.HOSP_REASON_COVID,
    },
    {
      color: COLOR_HOSP_CAUSE_OTHER,
      legendKey: 'DetailCardHospCause.Legend.Other',
      tooltipKey: 'DetailCardHospCause.Legend.Other',
      gdiSubset: GdiSubset.HOSP_REASON_OTHER,
    },
    {
      color: COLOR_HOSP_CAUSE_UNKNOWN,
      legendKey: 'DetailCardHospCause.Legend.Unknown',
      tooltipKey: 'DetailCardHospCause.Legend.Unknown',
      gdiSubset: GdiSubset.HOSP_REASON_UNKNOWN,
    },
  ]

  constructor(
    route: ActivatedRoute,
    router: Router,
    translator: TranslatorService,
    uriService: UriService,
    tooltipService: TooltipService,
  ) {
    super(route, router, translator, uriService, tooltipService)
    merge(
      this.relativityFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.EPI_REL_ABS_HOSP_CAUSE_FILTER]: v }))),
      this.personsAgeFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.EPI_AGE_HOSP_CAUSE_FILTER]: v }))),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))
  }

  readonly yLabelFmt = (val: number) => `${val}%`

  showLineChartTooltip({ source, data }: HistogramElFocusEvent<HospCauseHistogramLineEntry>) {
    const legendPairEntries: TooltipEntry[] = this.chartDefinition
      .map((lineDef, index) => ({
        key: lineDef.tooltipKey,
        value: data.values[index],
        color: lineDef.color,
      }))
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    const ctx = this.prepareTooltipContentData(data, legendPairEntries, false)
    if (!ctx) {
      return this.hideTooltip()
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, { position: 'above', offsetY: 16 })
  }

  showBarChartTooltip({ source, data }: HistogramElFocusEvent<HospCauseHistogramBarEntry>) {
    const legendPairEntries: TooltipEntry[] = this.chartDefinition
      .map((lineDef, index) => ({
        key: lineDef.tooltipKey,
        value: data.barValues[index],
        color: lineDef.color,
      }))
      .reverse()

    const ctx = this.prepareTooltipContentData(data, legendPairEntries, true)
    if (!ctx) {
      return this.hideTooltip()
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, { position: 'above', offsetY: 16 })
  }

  private prepareChart(cv: CurrentValues): ChartData | null {
    const ageDataFiltered = filterBucketData(cv.chartData, [cv.personsAgeFilter])
    const legendPairs: Array<[string, string]> = this.chartDefinition.map((lineDef) => [
      lineDef.color,
      lineDef.legendKey,
    ])
    const colors = this.chartDefinition.map((lineDef) => lineDef.color)
    return {
      legendPairs,
      colors,
      lineData: this.prepareLineData(ageDataFiltered, cv.relativityFilter),
      lineSkipNoDataBefore: addDays(parseIsoDate(cv.chartData[0].start), 1),
      barData: this.prepareBarData(ageDataFiltered, cv.relativityFilter),
      isInz: cv.relativityFilter === Inz100KAbsRelFilter.INZ_100K,
      isRel: cv.relativityFilter === Inz100KAbsRelFilter.RELATIVE,
    }
  }

  private prepareLineData(
    bucketData: HospReasonsAgeBucketData[],
    relativityFilter: Inz100KAbsRelFilter,
  ): HospCauseHistogramLineEntry[] | null {
    if (relativityFilter === Inz100KAbsRelFilter.RELATIVE) {
      return null
    }

    const entries = bucketData.map((entry): HospCauseHistogramLineEntry => {
      const startDate = parseIsoDate(entry.start)
      const date = parseIsoDate(entry.end)
      return {
        date,
        startDate,
        values: this.chartDefinition.map((lineDef) =>
          this.determineChartCorrespondingValue(entry.buckets[0][lineDef.gdiSubset], relativityFilter),
        ),
      }
    })
    entries.unshift({ date: parseIsoDate(bucketData[0].start), values: [], startDate: null })

    return entries
  }

  private prepareBarData(
    bucketData: HospReasonsAgeBucketData[],
    relativityFilter: Inz100KAbsRelFilter,
  ): HospCauseHistogramBarEntry[] | null {
    if (relativityFilter !== Inz100KAbsRelFilter.RELATIVE) {
      return null
    }

    return bucketData.map((entry): HospCauseHistogramBarEntry => {
      const startDate = parseIsoDate(entry.start)
      const date = parseIsoDate(entry.end)
      return {
        date,
        startDate,
        lineValues: [],
        barValues: this.chartDefinition.map((lineDef) =>
          this.determineChartCorrespondingValue(entry.buckets[0][lineDef.gdiSubset], relativityFilter),
        ),
      }
    })
  }

  private prepareTooltipContentData(
    data: HospCauseHistogramLineEntry | HospCauseHistogramBarEntry,
    legendPairEntries: TooltipEntry[],
    isRel: boolean,
  ): TooltipListContentData | null {
    if (!data.startDate || !data.date) {
      return null
    }

    const entryFn = (entry: TooltipEntry): TooltipListContentEntry => ({
      label: this.translator.get(entry.key),
      value: adminFormatNum(entry.value, isRel ? 2 : undefined, isRel ? '%' : undefined),
      color: entry.color,
    })

    const entries = legendPairEntries.map(entryFn)
    return {
      title: this.translator.get('Commons.DateToDate', {
        date1: formatUtcDate(data.startDate),
        date2: formatUtcDate(data.date),
      }),
      noData: entries.length === 0,
      entries,
    }
  }

  private readonly determineChartCorrespondingValue = (
    covidValue: DefaultBucketValue<HospReasonsAgeRangeValues>,
    relFilter: Inz100KAbsRelFilter,
  ) => {
    switch (relFilter) {
      case Inz100KAbsRelFilter.INZ_100K:
        return covidValue.inzWeek
      case Inz100KAbsRelFilter.ABSOLUTE:
        return covidValue.week
      default:
        return covidValue.percentage
    }
  }
}
