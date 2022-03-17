import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  BucketData,
  DefaultBucketValue,
  EpidemiologicVaccDosesAdministeredIndicationDevelopmentData,
  EpidemiologicVaccIndicationDevelopmentEntry,
  EpidemiologicVaccIndicationTimelineEntry,
  GdiSubset,
  GdiVariant,
  GeoUnit,
  isDefined,
  VaccinationIndication,
  VaccinationIndicationGeneral,
} from '@c19/commons'
import { getEnumKeyFromValue, getEnumKeys, getEnumValues } from '@shiftcode/utilities'
import { scaleQuantize } from 'd3'
import { combineLatest, merge, Observable } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { MatrixBucketEntry, MatrixElementEvent, MatrixEntry } from '../../diagrams/matrix/base-matrix.component'
import { DefinedEntry, HeatmapFillFn } from '../../diagrams/matrix/matrix-heatmap/matrix-heatmap.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLOR_NO_CASE, COLORS_INDICATIONS_GENERAL, COLORS_VACC_HEATMAP } from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import {
  DEFAULT_VACC_INDICATION_CUMULATIVE_FILTER,
  getVaccCumulativeFilterOptions,
  VaccCumulativeFilter,
} from '../../shared/models/filters/vacc-cumulative-filter.enum'
import { Inz100AbsFilter } from '../../shared/models/filters/relativity/inz100-abs-filter.enum'

import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { createMatrixData, MatrixCreationData } from '../../static-utils/data-utils'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { deepEqual } from '../../static-utils/deep-equal.function'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import {
  createMultiSelectQueryParamValue,
  filterHistoColors,
  filterHistoLegendPairs,
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
  relativityFilter: Inz100AbsFilter
  cumulativeFilter: VaccCumulativeFilter
  isRel: boolean
  indications: VaccinationIndicationGeneral[]
}

interface IndicationMatrixCreationData extends MatrixCreationData<MatrixBucketEntry> {
  bucketName: string
}

interface DemoMatrixEntry<B extends MatrixBucketEntry> extends MatrixEntry<Date, B> {
  startDate: Date
  endDate: Date
}

interface MatrixData {
  matrixData: {
    indication: MatrixCreationData<MatrixBucketEntry>
    indicationDataPerBucket: IndicationMatrixCreationData[]
    indicationFillFn: HeatmapFillFn<MatrixBucketEntry>
  }
  histogramData: CumulativeChartData
  isRel: boolean

  showCumulative: boolean
  showWeeklyValues: boolean
}

interface CumulativeChartEntry extends HistogramLineEntry {
  forceHideTooltip?: boolean
}

interface CumulativeChartData {
  data: CumulativeChartEntry[]
  hasNullValues: boolean
  histoColors: string[]
  histoLegendPairs: [string, string][]
}

type TempValueEntry = [
  EpidemiologicVaccIndicationDevelopmentEntry,
  Record<VaccinationIndication, EpidemiologicVaccIndicationTimelineEntry>,
]

type IndicationBucketData = BucketData<
  DefaultBucketValue<GdiVariant.VALUE | GdiVariant.INZ | GdiVariant.TOTAL | GdiVariant.INZ_TOTAL>,
  any
>

@Component({
  selector: 'bag-detail-card-vacc-doses-indication',
  templateUrl: './detail-card-vacc-doses-indication.component.html',
  styleUrls: ['./detail-card-vacc-doses-indication.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVaccDosesIndicationComponent
  extends BaseDetailCardVaccinationComponent<EpidemiologicVaccDosesAdministeredIndicationDevelopmentData>
  implements OnInit
{
  readonly cardDetailPath = RoutePaths.SHARE_VACC_INDICATION
  readonly heatmapScaleColors = COLORS_VACC_HEATMAP

  readonly cumulativeCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.INDICATION_CUMULATIVE_FILTER])
  readonly cumulativeFilterOptions = getVaccCumulativeFilterOptions(DEFAULT_VACC_INDICATION_CUMULATIVE_FILTER)
  readonly cumulativeFilter$: Observable<VaccCumulativeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.INDICATION_CUMULATIVE_FILTER, DEFAULT_VACC_INDICATION_CUMULATIVE_FILTER),
    tap<VaccCumulativeFilter>(emitValToOwnViewFn(this.cumulativeCtrl, DEFAULT_VACC_INDICATION_CUMULATIVE_FILTER)),
  )

  readonly indicationFilterOptions: MultiSelectValueOption[] = getEnumValues(VaccinationIndicationGeneral).map(
    (indication): MultiSelectValueOption => ({
      value: indication,
      label: this.translator.get(`VaccIndication.${getEnumKeyFromValue(VaccinationIndicationGeneral, indication)}`),
    }),
  )
  readonly indicationFilterCtrl = new FormControl(
    readMultiSelectQueryParamValue(
      [...this.indicationFilterOptions],
      VaccinationIndicationGeneral,
      this.route.snapshot.queryParams[QueryParams.INDICATION_VIEW_INDICATION_FILTER],
    ),
  )
  readonly indicationFilter$: Observable<MultiSelectValueOption[]> = this.route.queryParams.pipe(
    selectChanged(QueryParams.INDICATION_VIEW_INDICATION_FILTER, null),
    map((v) => readMultiSelectQueryParamValue([...this.indicationFilterOptions], VaccinationIndicationGeneral, v)),
    tap<MultiSelectValueOption[]>(emitValToOwnViewFn(this.indicationFilterCtrl)),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.vaccDosesRelativityFilter$,
    this.cumulativeFilter$,
    this.indicationFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[relativityFilter, cumulativeFilter, indicationFilter], geoUnit]) => {
      const isRel = relativityFilter === Inz100AbsFilter.INZ_100
      return {
        geoUnit,
        relativityFilter,
        isRel,
        cumulativeFilter,
        indications: <VaccinationIndicationGeneral[]>indicationFilter.map((v) => v.value),
        timeSpan: this.data.timeSpan,
      }
    }),
    distinctUntilChanged(deepEqual),
    shareReplay(1),
  )
  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))

  readonly indicationData$ = this.currentValues$.pipe(map(this.prepareChartData.bind(this)))

  keys: Record<
    'info' | 'descriptionTitle' | 'sourceDesc' | 'metaRel' | 'metaAbs' | 'tooltipRel' | 'tooltipAbs' | 'legendZero',
    string
  >

  override ngOnInit() {
    super.ngOnInit()
    merge(
      this.cumulativeCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.INDICATION_CUMULATIVE_FILTER]: v }))),
      this.indicationFilterCtrl.valueChanges.pipe(
        map((v: MultiSelectValueOption[]) => createMultiSelectQueryParamValue(v, this.indicationFilterOptions)),
        map((v) => ({ [QueryParams.INDICATION_VIEW_INDICATION_FILTER]: v })),
      ),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))

    this.cumulativeFilter$
      .pipe(
        takeUntil(this.onDestroy),
        filter((v) => v === VaccCumulativeFilter.WEEKLY),
      )
      .subscribe(() => this.indicationFilterCtrl.setValue([...this.indicationFilterOptions]))
  }

  demoViewMultiSelectFilterLabelFn: (value: MultiSelectValueOption[]) => string = (value: MultiSelectValueOption[]) => {
    return value.length === this.indicationFilterOptions.length
      ? this.translator.get('VaccIndicationFilter.AllSelected')
      : this.translator.get('VaccIndicationFilter.CountSelected', { count: value.length })
  }

  showMatrixTooltip(
    { source, data }: MatrixElementEvent<DefinedEntry<DemoMatrixEntry<MatrixBucketEntry>, Date, MatrixBucketEntry>>,
    isRel: boolean,
  ) {
    const valKey: string = isRel ? this.keys.tooltipRel : this.keys.tooltipAbs
    const isValueDefined = isDefined(data.bucketEntry.value)
    const ctx: TooltipListContentData = {
      title: this.translator.get(
        `VaccIndication.${getEnumKeyFromValue(VaccinationIndicationGeneral, data.bucketEntry.bucketName)}`,
      ),
      date: this.dateRangeLabel(data.entry.startDate, data.entry.endDate),
      noData: !isValueDefined,
      entries: [
        {
          label: this.translator.get(valKey),
          value: adminFormatNum(data.bucketEntry.value, isRel ? 2 : undefined),
        },
      ],
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: 'above',
      offsetY: 12,
      maxWidth: 400,
    })
  }

  showCumulTooltip(
    { source, data }: HistogramElFocusEvent<CumulativeChartEntry>,
    isRel: boolean,
    histoLegendPairs: [string, string][],
  ) {
    if (data.forceHideTooltip) {
      this.hideTooltip()
      return
    }
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: data.values
        .map((val, ix): TooltipListContentEntry & { _val: number | null } => ({
          color: histoLegendPairs[ix][0],
          label: histoLegendPairs[ix][1],
          value: adminFormatNum(val, isRel ? 2 : undefined),
          type: 'square',
          _val: val,
        }))
        .sort((a, b) => (b._val || 0) - (a._val || 0)),
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
      maxWidth: 400,
    })
  }

  protected init() {
    this.keys = {
      info: 'Vaccination.VaccDoses.Card.Indication.Info',
      descriptionTitle: 'Vaccination.Card.DosesAdministered',
      sourceDesc: 'Vaccination.Card.DosesAdministered',
      metaRel: 'Vaccination.VaccDoses.Card.Indication.Weekly.Legend.Rel',
      metaAbs: 'Vaccination.VaccDoses.Card.Indication.Weekly.Legend.Abs',
      tooltipRel: 'Vaccination.VaccDoses.Card.Indication.Weekly.Tooltip.Rel',
      tooltipAbs: 'Vaccination.VaccDoses.Card.Indication.Weekly.Tooltip.Abs',
      legendZero: 'Vaccination.VaccDoses.Card.Indication.Weekly.Legend.Zero',
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

  private dateRangeLabel(startDate: Date, endDate: Date): string {
    return this.translator.get('Commons.DateToDate', {
      date1: formatUtcDate(startDate),
      date2: formatUtcDate(endDate),
    })
  }

  private transformToBucketData(values: TempValueEntry[]): IndicationBucketData[] {
    return values.map(([e, rec]) => {
      return {
        start: e.start,
        end: e.end,
        isoWeek: e.isoWeek,
        buckets: getEnumKeys(VaccinationIndicationGeneral).map((indication) => {
          return {
            bucket: VaccinationIndicationGeneral[indication],
            [GdiVariant.VALUE]: rec[VaccinationIndicationGeneral[indication]].value,
            [GdiVariant.INZ]: rec[VaccinationIndicationGeneral[indication]].inz,
            [GdiVariant.TOTAL]: rec[VaccinationIndicationGeneral[indication]].total,
            [GdiVariant.INZ_TOTAL]: rec[VaccinationIndicationGeneral[indication]].inzTotal,
          }
        }),
      }
    })
  }

  private prepareChartData(cv: CurrentValues): MatrixData | null {
    const tempValueEntries: TempValueEntry[] = this.data.values.map((v) => [v, v[GdiSubset.VACC_DOSES_ADMIN]])

    const transformedBucketData: IndicationBucketData[] = this.transformToBucketData(tempValueEntries)

    const indicationMatrixData = createMatrixData(transformedBucketData, cv.isRel ? GdiVariant.INZ : GdiVariant.VALUE)
    if (indicationMatrixData.entries.length === 0) {
      return null
    }

    const indicationDataPerBucket: IndicationMatrixCreationData[] = []

    getEnumValues(VaccinationIndicationGeneral).forEach((bucketName) => {
      const bucketData: IndicationMatrixCreationData = {
        ...indicationMatrixData,
        bucketName: this.translator.get(
          `VaccIndication.${getEnumKeyFromValue(VaccinationIndicationGeneral, bucketName)}`,
        ),
      }
      bucketData.entries = bucketData.entries.map((entry) => {
        return { ...entry, buckets: entry.buckets.filter((b) => b.bucketName === bucketName) }
      })
      indicationDataPerBucket.push(bucketData)
    })

    const scaleQuantizeZ = scaleQuantize<string>()
      .domain([indicationMatrixData.min, indicationMatrixData.max])
      .range(COLORS_VACC_HEATMAP)

    const indicationFillFn: HeatmapFillFn<MatrixBucketEntry> = (e, svg) => {
      return !isDefined(e.value) ? svg.noDataFill : e.value > 0 ? <string>scaleQuantizeZ(e.value) : COLOR_NO_CASE
    }

    return {
      isRel: cv.isRel,
      matrixData: {
        indication: indicationMatrixData,
        indicationDataPerBucket,
        indicationFillFn,
      },
      histogramData: this.transformToCumulativeData(tempValueEntries, cv),
      showCumulative: cv.cumulativeFilter === VaccCumulativeFilter.TOTAL,
      showWeeklyValues: cv.cumulativeFilter === VaccCumulativeFilter.WEEKLY,
    }
  }

  private transformToCumulativeData(values: TempValueEntry[], cv: CurrentValues): CumulativeChartData {
    const relevantGdi = cv.isRel ? GdiVariant.INZ_TOTAL : GdiVariant.TOTAL
    const indicationKeys = cv.indications.length
      ? cv.indications
      : <VaccinationIndicationGeneral[]>getEnumValues(VaccinationIndicationGeneral)

    const entries: CumulativeChartEntry[] = values.map(([e, rec]) => ({
      date: parseIsoDate(e.end),
      values: indicationKeys.map((indication) => rec[indication][relevantGdi]),
    }))
    const histoColors = filterHistoColors(COLORS_INDICATIONS_GENERAL, cv.indications, VaccinationIndicationGeneral)
    const histoLegendPairs = filterHistoLegendPairs(histoColors, cv.indications, VaccinationIndicationGeneral)
      .reverse()
      .map((pair) => {
        pair[1] = this.translator.get(`VaccIndication.${getEnumKeyFromValue(VaccinationIndicationGeneral, pair[1])}`)
        return pair
      })

    // add empty entry with the weeks start
    const leftPadEntries: CumulativeChartEntry[] = entries
      ? [
          {
            date: parseIsoDate(values[0][0].start),
            values: [],
            forceHideTooltip: true,
          },
        ]
      : []
    return {
      data: [...leftPadEntries, ...entries],
      hasNullValues: entries.some((e) => !e.values.some(isDefined)),
      histoColors,
      histoLegendPairs,
    }
  }
}
