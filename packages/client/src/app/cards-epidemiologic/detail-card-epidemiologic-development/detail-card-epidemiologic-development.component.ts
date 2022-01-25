import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CantonGeoUnit,
  DetailTimelineValues,
  EpidemiologicDevelopmentData,
  EpidemiologicDevValuesOPT,
  EpidemiologicTestDevelopmentData,
  EpidemiologicTestDevValuesOPT,
  EpiTimelineEntry,
  GdiObject,
  GdiVariant,
  HistogramDetailCard,
  isDefined,
  TopLevelGeoUnit,
} from '@c19/commons'
import { combineLatest, Observable } from 'rxjs'
import { map, mapTo, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { TranslatorService } from '../../core/i18n/translator.service'
import { UriService } from '../../core/uri.service'
import { HistogramDetailEntry } from '../../diagrams/histogram/histogram-detail/histogram-detail.component'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_NEWLY_REPORTED,
  COLOR_ROLLMEAN,
  COLOR_ROLLMEAN_REF,
  COLOR_SUM_ANTIGEN,
  COLOR_SUM_PCR,
  COLOR_TOTAL,
  GRADIENT_14_D_LEGEND,
} from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import { CumulativeFilter, DEFAULT_CUMULATIVE_FILTER } from '../../shared/models/filters/cumulative-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { RelativityFilter } from '../../shared/models/filters/relativity-filter.enum'
import { TimeSlotFilter, timeSlotFilterTimeFrameKey } from '../../shared/models/filters/time-slot-filter.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { getTimeslotCorrespondingValues } from '../../static-utils/data-utils'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { DOM_ID } from '../../static-utils/dom-id.const'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { BaseDetailEpidemiologicCardComponent, CurrentValuesBase } from '../base-detail-epidemiologic-card.component'

interface CurrentDevelopmentValues extends CurrentValuesBase {
  cumulativeFilter: CumulativeFilter
  isInz: boolean
  values: EpiTimelineEntry<any, any>[]
}

interface DailyChartEntry extends HistogramDetailEntry {
  total: number
}

interface BaseChartData {
  isInz: boolean
  hasNoData: boolean
}

interface DailyChartData extends BaseChartData {
  data: DailyChartEntry[]
  showRefMean: boolean
  hasStacked: boolean
  histogramDef: HistogramDef
  legendBarDef: Array<[string, string]>
}

interface CumulativeChartEntry extends HistogramLineEntry {
  additional: { value1: number | null; value2: number | null }
}

type TwoWeekChartEntry = HistogramLineEntry

interface TwoWeekChartData extends BaseChartData {
  data: TwoWeekChartEntry[]
  legendPairs: Array<readonly [string, string, number]>
  geoUnit: CantonGeoUnit | TopLevelGeoUnit
}

interface CumulativeChartData extends BaseChartData {
  data: CumulativeChartEntry[]
  cumulativeDef: CumulativeDef
}

export type HistoDetailCardData = HistogramDetailCard<DetailTimelineValues>

interface HistogramPartDef {
  gdi: DetailTimelineValues
  legendKey: string
  tooltipKey?: string
  color: string
}

interface HistogramDef {
  value: HistogramPartDef
  stacked?: HistogramPartDef
  mean: HistogramPartDef
  refMean?: HistogramPartDef
}

interface CumulativePartDef {
  gdi: Record<TimeSlotFilter, DetailTimelineValues>
  tooltipKey: string
}

interface CumulativeDef {
  total: CumulativePartDef
  value1?: CumulativePartDef
  value2?: CumulativePartDef
}

@Component({
  selector: 'bag-detail-card-epidemiologic-development',
  templateUrl: './detail-card-epidemiologic-development.component.html',
  styleUrls: ['./detail-card-epidemiologic-development.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '[attr.id]': `'${DOM_ID.EPI_DEVELOPMENT_CARD}'`,
  },
})
export class DetailCardEpidemiologicDevelopmentComponent extends BaseDetailEpidemiologicCardComponent<
  EpidemiologicDevelopmentData | EpidemiologicTestDevelopmentData
> {
  private static keyMappingInz: Record<TimeSlotFilter, EpidemiologicDevValuesOPT> = {
    [TimeSlotFilter.TOTAL]: GdiVariant.INZ_TOTAL,
    [TimeSlotFilter.PHASE_2]: GdiVariant.INZ_P2,
    [TimeSlotFilter.PHASE_2B]: GdiVariant.INZ_P2B,
    [TimeSlotFilter.PHASE_3]: GdiVariant.INZ_P3,
    [TimeSlotFilter.PHASE_4]: GdiVariant.INZ_P4,
    [TimeSlotFilter.PHASE_5]: GdiVariant.INZ_P5,
    [TimeSlotFilter.LAST_4_WEEKS]: GdiVariant.INZ_28D,
    [TimeSlotFilter.LAST_2_WEEKS]: GdiVariant.INZ_14D,
  }
  private static keyMappingAbs: Record<TimeSlotFilter, EpidemiologicDevValuesOPT> = {
    [TimeSlotFilter.TOTAL]: GdiVariant.TOTAL,
    [TimeSlotFilter.PHASE_2]: GdiVariant.SUMP2,
    [TimeSlotFilter.PHASE_2B]: GdiVariant.SUMP2B,
    [TimeSlotFilter.PHASE_3]: GdiVariant.SUMP3,
    [TimeSlotFilter.PHASE_4]: GdiVariant.SUMP4,
    [TimeSlotFilter.PHASE_5]: GdiVariant.SUMP5,
    [TimeSlotFilter.LAST_4_WEEKS]: GdiVariant.SUM28D,
    [TimeSlotFilter.LAST_2_WEEKS]: GdiVariant.SUM14D,
  }
  private static keyMappingPcrInz: Record<TimeSlotFilter, EpidemiologicTestDevValuesOPT> = {
    [TimeSlotFilter.TOTAL]: GdiVariant.INZ_TOTAL_PCR,
    [TimeSlotFilter.PHASE_2]: GdiVariant.INZ_P2_PCR,
    [TimeSlotFilter.PHASE_2B]: GdiVariant.INZ_P2B_PCR,
    [TimeSlotFilter.PHASE_3]: GdiVariant.INZ_P3_PCR,
    [TimeSlotFilter.PHASE_4]: GdiVariant.INZ_P4_PCR,
    [TimeSlotFilter.PHASE_5]: GdiVariant.INZ_P5_PCR,
    [TimeSlotFilter.LAST_4_WEEKS]: GdiVariant.INZ_28D_PCR,
    [TimeSlotFilter.LAST_2_WEEKS]: GdiVariant.INZ_14D_PCR,
  }
  private static keyMappingPcrAbs: Record<TimeSlotFilter, EpidemiologicTestDevValuesOPT> = {
    [TimeSlotFilter.TOTAL]: GdiVariant.TOTAL_PCR,
    [TimeSlotFilter.PHASE_2]: GdiVariant.SUMP2_PCR,
    [TimeSlotFilter.PHASE_2B]: GdiVariant.SUMP2B_PCR,
    [TimeSlotFilter.PHASE_3]: GdiVariant.SUMP3_PCR,
    [TimeSlotFilter.PHASE_4]: GdiVariant.SUMP4_PCR,
    [TimeSlotFilter.PHASE_5]: GdiVariant.SUMP5_PCR,
    [TimeSlotFilter.LAST_4_WEEKS]: GdiVariant.SUM28D_PCR,
    [TimeSlotFilter.LAST_2_WEEKS]: GdiVariant.SUM14D_PCR,
  }
  private static keyMappingAntigenInz: Record<TimeSlotFilter, EpidemiologicTestDevValuesOPT> = {
    [TimeSlotFilter.TOTAL]: GdiVariant.INZ_TOTAL_ANTIGEN,
    [TimeSlotFilter.PHASE_2]: GdiVariant.INZ_P2_ANTIGEN,
    [TimeSlotFilter.PHASE_2B]: GdiVariant.INZ_P2B_ANTIGEN,
    [TimeSlotFilter.PHASE_3]: GdiVariant.INZ_P3_ANTIGEN,
    [TimeSlotFilter.PHASE_4]: GdiVariant.INZ_P4_ANTIGEN,
    [TimeSlotFilter.PHASE_5]: GdiVariant.INZ_P5_ANTIGEN,
    [TimeSlotFilter.LAST_4_WEEKS]: GdiVariant.INZ_28D_ANTIGEN,
    [TimeSlotFilter.LAST_2_WEEKS]: GdiVariant.INZ_14D_ANTIGEN,
  }
  private static keyMappingAntigenAbs: Record<TimeSlotFilter, EpidemiologicTestDevValuesOPT> = {
    [TimeSlotFilter.TOTAL]: GdiVariant.TOTAL_ANTIGEN,
    [TimeSlotFilter.PHASE_2]: GdiVariant.SUMP2_ANTIGEN,
    [TimeSlotFilter.PHASE_2B]: GdiVariant.SUMP2B_ANTIGEN,
    [TimeSlotFilter.PHASE_3]: GdiVariant.SUMP3_ANTIGEN,
    [TimeSlotFilter.PHASE_4]: GdiVariant.SUMP4_ANTIGEN,
    [TimeSlotFilter.PHASE_5]: GdiVariant.SUMP5_ANTIGEN,
    [TimeSlotFilter.LAST_4_WEEKS]: GdiVariant.SUM28D_ANTIGEN,
    [TimeSlotFilter.LAST_2_WEEKS]: GdiVariant.SUM14D_ANTIGEN,
  }

  /**
   * whether to use the `value` (total) or not
   * by default the absolute bars are split by `valuePrevious` and `valueNewlyReported`
   * if flag is set to true, just `value` is used instead
   */
  @Input()
  useTotalValForAbs = false

  readonly CumulativeFilter = CumulativeFilter
  readonly cardDetailPath = RoutePaths.SHARE_DEVELOPMENT

  readonly cumulativeFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.CUMULATIVE_FILTER] || null,
  )
  readonly cumulativeFilter$: Observable<CumulativeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.CUMULATIVE_FILTER, DEFAULT_CUMULATIVE_FILTER),
    tap<CumulativeFilter>(emitValToOwnViewFn(this.cumulativeFilterCtrl, DEFAULT_CUMULATIVE_FILTER)),
  )

  readonly currentValues$: Observable<CurrentDevelopmentValues> = combineLatest([
    this.timeFilter$,
    this.relFilter$,
    this.cumulativeFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[timeFilter, relativityFilter, cumulativeFilter], geoUnit]) => {
      const timeFrame = this.data.timeframes[timeSlotFilterTimeFrameKey[timeFilter]]
      const values: EpiTimelineEntry<any, any>[] = this.data.values
      return {
        geoUnit,
        timeFilter,
        relativityFilter,
        timeFrame,
        cumulativeFilter,
        values: getTimeslotCorrespondingValues(values, timeFrame),
        isInz: relativityFilter === RelativityFilter.INZ_100K,
      }
    }),
    shareReplay(1),
  )

  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))
  readonly dailyChart$ = this.currentValues$.pipe(map(this.prepareDailyChart.bind(this)), shareReplay(1))
  readonly cumulativeChart$ = this.currentValues$.pipe(map(this.prepareCumulativeChart.bind(this)), shareReplay(1))
  readonly twoWeekChart$ = this.currentValues$.pipe(map(this.prepareTwoWeekChart.bind(this)), shareReplay(1))

  private histogramAbsDef: HistogramDef
  private histogramInzDef: HistogramDef
  private cumulativeAbsDef: CumulativeDef
  private cumulativeInzDef: CumulativeDef

  constructor(
    route: ActivatedRoute,
    router: Router,
    translator: TranslatorService,
    uriService: UriService,
    tooltipService: TooltipService,
  ) {
    super(route, router, translator, uriService, tooltipService)

    this.cumulativeFilterCtrl.valueChanges
      .pipe(
        map((v) => ({ [QueryParams.CUMULATIVE_FILTER]: <string>v })),
        takeUntil(this.onDestroy),
      )
      .subscribe(updateQueryParamsFn(router))
  }

  showDailyChartTooltip({ source, data }: HistogramElFocusEvent<DailyChartEntry>, def: HistogramDef, isInz: boolean) {
    const valKey: string = isInz ? this.tooltipInzKey : this.tooltipAbsKey
    const entries: TooltipListContentEntry[] = []
    if (isDefined(data.total) && !this.isGdiTest) {
      entries.push({
        label: this.translator.get(valKey),
        value: adminFormatNum(data.total),
        color: def.value.color,
      })
    }
    if (def.value.tooltipKey && isDefined(data.barValues[0])) {
      entries.push({
        label: this.translator.get(def.value.tooltipKey),
        value: adminFormatNum(data.barValues[0]),
        color: def.value.color,
      })
    }
    // defined and !== 0)
    if (def.stacked?.tooltipKey && data.barValues[1]) {
      entries.push({
        label: this.translator.get(def.stacked.tooltipKey),
        value: adminFormatNum(data.barValues[1]),
        color: def.stacked?.color,
        borderBelow: this.isGdiTest,
      })
    }
    if (isDefined(data.total) && this.isGdiTest) {
      entries.push({
        label: this.translator.get(valKey),
        value: adminFormatNum(data.total),
        color: null,
      })
    }
    if (def.mean.tooltipKey && isDefined(data.lineValues[0])) {
      entries.push({
        label: this.translator.get(def.mean.tooltipKey),
        value: adminFormatNum(data.lineValues[0]),
        color: def.mean.color,
        type: 'mean',
      })
    }
    if (def.refMean && def.refMean.tooltipKey && isDefined(data.lineValues[1])) {
      entries.push({
        label: this.translator.get(def.refMean.tooltipKey),
        value: adminFormatNum(data.lineValues[1]),
        color: def.refMean.color,
        type: 'refMean',
      })
    }
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      noData: entries.length === 0,
      entries,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, { position: 'above', offsetY: 16 })
  }

  showCumulativeChartTooltip({ source, data }: HistogramElFocusEvent<CumulativeChartEntry>, def: CumulativeDef) {
    const [v0] = data.values
    const entries: TooltipListContentEntry[] = []
    if (isDefined(v0)) {
      entries.push({ label: this.translator.get(def.total.tooltipKey), value: adminFormatNum(v0) })
    }
    if (isDefined(def.value1) && isDefined(data.additional) && data.additional.value1) {
      entries.push({
        label: this.translator.get(def.value1.tooltipKey),
        value: adminFormatNum(data.additional.value1),
      })
    }
    if (isDefined(def.value2) && isDefined(data.additional) && data.additional.value2) {
      entries.push({
        label: this.translator.get(def.value2.tooltipKey),
        value: adminFormatNum(data.additional.value2),
      })
    }
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries,
      noData: entries.length === 0,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  showTwoWeekChartTooltip(
    { source, data }: HistogramElFocusEvent<TwoWeekChartEntry>,
    geoUnit: CantonGeoUnit | TopLevelGeoUnit,
  ) {
    const [v0, v1] = data.values
    const entries: TooltipListContentEntry[] = [
      {
        label: this.translator.get(`GeoFilter.${geoUnit}`),
        value: adminFormatNum(v0),
        color: isDefined(v1) ? GRADIENT_14_D_LEGEND : undefined,
        type: 'mean',
      },
    ]
    if (isDefined(v1)) {
      entries.push({
        label: `${TopLevelGeoUnit.CH} + ${TopLevelGeoUnit.FL}`,
        value: adminFormatNum(v1),
        color: GRADIENT_14_D_LEGEND,
        type: 'refMean',
      })
    }
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries,
      noData: !isDefined(v0),
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  initCard(topic: string, gdiObject: GdiObject) {
    this.infoKey = `DetailCardDevelopment.InfoText.${topic}`
    switch (gdiObject) {
      case GdiObject.CASE:
      case GdiObject.DEATH:
      case GdiObject.HOSP:
        this.titleKey = `DetailCardDevelopment.Title`
        this.histogramAbsDef = {
          value: {
            gdi: GdiVariant.VALUE_PREVIOUS,
            legendKey: 'DetailCardDevelopment.Legend.Cases',
            color: COLOR_TOTAL,
          },
          stacked: {
            gdi: GdiVariant.VALUE_NEWLY_REPORTED,
            legendKey: 'DetailCardDevelopment.Legend.DeltaDay',
            tooltipKey: 'DetailCardDevelopment.Legend.DeltaDay.Abbr',
            color: COLOR_NEWLY_REPORTED,
          },
          mean: {
            gdi: GdiVariant.ROLLMEAN_7D,
            color: COLOR_ROLLMEAN,
            legendKey: 'DetailCardDevelopment.Legend.Mean',
            tooltipKey: 'DetailCardDevelopment.Legend.Mean',
          },
        }
        this.histogramInzDef = {
          value: {
            gdi: GdiVariant.INZ,
            legendKey: 'DetailCardDevelopment.Legend.Cases',
            color: COLOR_TOTAL,
          },
          mean: {
            gdi: GdiVariant.INZ_ROLLMEAN_7D,
            color: COLOR_ROLLMEAN,
            legendKey: 'DetailCardDevelopment.Legend.Mean',
            tooltipKey: 'DetailCardDevelopment.Legend.Mean',
          },
          refMean: {
            gdi: GdiVariant.INZ_ROLLMEAN_7D_CHFL,
            color: COLOR_ROLLMEAN_REF,
            legendKey: 'DetailCardDevelopment.Legend.Mean.CHFL',
            tooltipKey: 'DetailCardDevelopment.Legend.Mean.CHFL.Abbr',
          },
        }
        this.cumulativeAbsDef = {
          total: {
            gdi: DetailCardEpidemiologicDevelopmentComponent.keyMappingAbs,
            tooltipKey: 'Commons.Cases',
          },
        }
        this.cumulativeInzDef = {
          total: {
            gdi: DetailCardEpidemiologicDevelopmentComponent.keyMappingInz,
            tooltipKey: 'Commons.Cases.Inz100K.Abbr',
          },
        }
        break
      case GdiObject.TEST:
        this.titleKey = 'DetailCardDevelopment.Title.DetailTest'
        this.histogramAbsDef = {
          value: {
            gdi: GdiVariant.VALUE_PCR,
            legendKey: 'DetailTest.Development.Legend.PCR',
            tooltipKey: 'DetailTest.Development.Tooltip.PCR.Abbr',
            color: COLOR_SUM_PCR,
          },
          stacked: {
            gdi: GdiVariant.VALUE_ANTIGEN,
            legendKey: 'DetailTest.Development.Legend.ANTIGEN',
            tooltipKey: 'DetailTest.Development.Tooltip.ANTIGEN.Abbr',
            color: COLOR_SUM_ANTIGEN,
          },
          mean: {
            gdi: GdiVariant.ROLLMEAN_7D,
            color: COLOR_ROLLMEAN,
            legendKey: 'DetailCardDevelopment.Legend.Mean',
            tooltipKey: 'DetailCardDevelopment.Legend.Mean',
          },
        }
        this.histogramInzDef = {
          value: {
            gdi: GdiVariant.INZ_PCR,
            legendKey: 'DetailTest.Development.Legend.PCR',
            tooltipKey: 'DetailTest.Development.Tooltip.PCR.Abbr',
            color: COLOR_SUM_PCR,
          },
          stacked: {
            gdi: GdiVariant.INZ_ANTIGEN,
            legendKey: 'DetailTest.Development.Legend.ANTIGEN',
            tooltipKey: 'DetailTest.Development.Tooltip.ANTIGEN.Abbr',
            color: COLOR_SUM_ANTIGEN,
          },
          mean: {
            gdi: GdiVariant.INZ_ROLLMEAN_7D,
            color: COLOR_ROLLMEAN,
            legendKey: 'DetailCardDevelopment.Legend.Mean',
            tooltipKey: 'DetailCardDevelopment.Legend.Mean',
          },
          refMean: {
            gdi: GdiVariant.INZ_ROLLMEAN_7D_CHFL,
            color: COLOR_ROLLMEAN_REF,
            legendKey: 'DetailCardDevelopment.Legend.Mean.CHFL',
            tooltipKey: 'DetailCardDevelopment.Legend.Mean.CHFL.Abbr',
          },
        }
        this.cumulativeAbsDef = {
          total: {
            gdi: DetailCardEpidemiologicDevelopmentComponent.keyMappingAbs,
            tooltipKey: 'Commons.Tests',
          },
          value1: {
            gdi: DetailCardEpidemiologicDevelopmentComponent.keyMappingPcrAbs,
            tooltipKey: 'DetailTest.Development.Tooltip.PCR.Abbr',
          },
          value2: {
            gdi: DetailCardEpidemiologicDevelopmentComponent.keyMappingAntigenAbs,
            tooltipKey: 'DetailTest.Development.Tooltip.ANTIGEN.Abbr',
          },
        }
        this.cumulativeInzDef = {
          total: {
            gdi: DetailCardEpidemiologicDevelopmentComponent.keyMappingInz,
            tooltipKey: 'Commons.Tests.Inz100K.Abbr',
          },
          value1: {
            gdi: DetailCardEpidemiologicDevelopmentComponent.keyMappingPcrInz,
            tooltipKey: 'DetailTest.Development.Tooltip.PCR.Abbr',
          },
          value2: {
            gdi: DetailCardEpidemiologicDevelopmentComponent.keyMappingAntigenInz,
            tooltipKey: 'DetailTest.Development.Tooltip.ANTIGEN.Abbr',
          },
        }
        break
      default:
      // do nothing, ignore CovidCT
    }
  }

  private prepareDailyChart(cv: CurrentDevelopmentValues): DailyChartData | null {
    if (cv.cumulativeFilter !== CumulativeFilter.DAILY) {
      return null
    }
    const { isInz } = cv
    const histogramDef = isInz ? this.histogramInzDef : this.histogramAbsDef
    const showRefMean = isInz && cv.geoUnit !== TopLevelGeoUnit.CHFL && cv.geoUnit !== TopLevelGeoUnit.CH
    const histoItems: DailyChartEntry[] = cv.values.map((entry) => {
      const date = parseIsoDate(entry.date)
      return {
        isInz,
        date,
        barValues: [entry[histogramDef.value.gdi], histogramDef.stacked ? entry[histogramDef.stacked.gdi] : null],
        lineValues: [
          entry[histogramDef.mean.gdi],
          showRefMean && histogramDef.refMean ? entry[histogramDef.refMean.gdi] : null,
        ],
        total: <number>(isInz ? entry.inz : entry.value),
      }
    })
    const hasStacked = histoItems.some((v) => isDefined(v.barValues[1]))
    const legendBarDef: Array<[string, string]> = [[histogramDef.value.color, histogramDef.value.legendKey]]
    if (histogramDef.stacked && hasStacked) {
      legendBarDef.push([histogramDef.stacked.color, histogramDef.stacked.legendKey])
    }
    return {
      isInz,
      data: histoItems,
      histogramDef,
      hasStacked,
      showRefMean,
      hasNoData: histoItems.some((v) => v.barValues[0] === null),
      legendBarDef,
    }
  }

  private prepareCumulativeChart(cv: CurrentDevelopmentValues): CumulativeChartData | null {
    if (cv.cumulativeFilter !== CumulativeFilter.CUMULATIVE) {
      return null
    }
    const { timeFilter, isInz } = cv
    const cumulativeDef = isInz ? this.cumulativeInzDef : this.cumulativeAbsDef
    const entries: CumulativeChartEntry[] = cv.values.map((entry) => ({
      date: parseIsoDate(entry.date),
      values: [entry[cumulativeDef.total.gdi[timeFilter]]],
      additional: {
        value1: cumulativeDef.value1 ? entry[cumulativeDef.value1.gdi[timeFilter]] : null,
        value2: cumulativeDef.value2 ? entry[cumulativeDef.value2.gdi[timeFilter]] : null,
      },
    }))
    return {
      isInz,
      data: entries,
      hasNoData: false,
      cumulativeDef,
    }
  }

  private prepareTwoWeekChart(cv: CurrentDevelopmentValues): TwoWeekChartData | null {
    if (cv.cumulativeFilter !== CumulativeFilter.TWO_WEEK_SUM) {
      return null
    }
    const { isInz, geoUnit } = cv
    const showRef = isInz && geoUnit !== TopLevelGeoUnit.CH && geoUnit !== TopLevelGeoUnit.CHFL

    return {
      data: cv.values.map((entry) => ({
        date: parseIsoDate(entry.date),
        values: showRef
          ? [isInz ? entry.inzRollsum14d : entry.rollsum14d, entry.inzRollsum14d_CHFL]
          : [isInz ? entry.inzRollsum14d : entry.rollsum14d],
      })),
      isInz,

      legendPairs: showRef
        ? [
            [GRADIENT_14_D_LEGEND, geoUnit, 4] as const,
            [GRADIENT_14_D_LEGEND, `${TopLevelGeoUnit.CH} + ${TopLevelGeoUnit.FL}`, 2] as const,
          ]
        : [],
      hasNoData: false,
      geoUnit: cv.geoUnit,
    }
  }
}
