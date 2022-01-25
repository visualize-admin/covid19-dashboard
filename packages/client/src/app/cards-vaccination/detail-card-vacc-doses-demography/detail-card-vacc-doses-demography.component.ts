import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  AgeRange,
  CantonGeoUnit,
  EpidemiologicVaccDemographyData,
  GdiVariant,
  isDefined,
  Sex,
  TopLevelGeoUnit,
} from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
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
import {
  COLOR_FEMALE_VACC,
  COLOR_MALE_VACC,
  COLOR_NO_CASE,
  COLOR_UNKNOWN_VACC,
  COLORS_CUMULATIVE,
  COLORS_VACC_HEATMAP,
} from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { RefMatrixBucketEntry } from '../../shared/models/demo-matrix-entry.model'
import {
  DEFAULT_VACC_DEMO_CUMULATIVE_FILTER,
  getVaccCumulativeFilterOptions,
  VaccCumulativeFilter,
} from '../../shared/models/filters/vacc-cumulative-filter.enum'
import { VaccinationRelativityFilter } from '../../shared/models/filters/vaccination-relativity-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { createMatrixData, createSexMatrixData, MatrixCreationData } from '../../static-utils/data-utils'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { deepEqual } from '../../static-utils/deep-equal.function'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import {
  createMultiSelectQueryParamValue,
  filterBucketData,
  filterHistoColors,
  filterHistoLegendPairs,
  MultiSelectValueOption,
  readMultiSelectQueryParamValue,
} from '../../static-utils/multi-select-filter-utils'
import { replaceHyphenWithEnDash } from '../../static-utils/replace-hyphen-with-en-dash.functions'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import {
  BaseDetailCardVaccinationComponent,
  CurrentValuesVaccinationBase,
} from '../base-detail-card-vaccination.component'

interface CurrentValues extends CurrentValuesVaccinationBase {
  relativityFilter: VaccinationRelativityFilter
  cumulativeFilter: VaccCumulativeFilter
  isRel: boolean
  ageRanges: string[]
}

interface DemoMatrixEntry<B extends MatrixBucketEntry> extends MatrixEntry<Date, B> {
  startDate: Date
  endDate: Date
}

interface MatrixData {
  matrixData: {
    age: MatrixCreationData<RefMatrixBucketEntry>
    gender: MatrixCreationData<MatrixBucketEntry>
    ageFillFn: HeatmapFillFn<RefMatrixBucketEntry>
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
  ageHistoColors: string[]
  histoLegendPairs: [string, string][]
}

@Component({
  selector: 'bag-detail-card-vacc-doses-demography',
  templateUrl: './detail-card-vacc-doses-demography.component.html',
  styleUrls: ['./detail-card-vacc-doses-demography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVaccDosesDemographyComponent
  extends BaseDetailCardVaccinationComponent<EpidemiologicVaccDemographyData>
  implements OnInit
{
  readonly cardDetailPath = RoutePaths.SHARE_DEMOGRAPHY
  readonly colorMale = COLOR_MALE_VACC
  readonly colorFemale = COLOR_FEMALE_VACC
  readonly colorUnknown = COLOR_UNKNOWN_VACC
  readonly heatmapScaleColors = COLORS_VACC_HEATMAP
  readonly stackColors = [COLOR_MALE_VACC, COLOR_UNKNOWN_VACC, COLOR_FEMALE_VACC]

  readonly matrixYLabelFmt = replaceHyphenWithEnDash

  readonly cumulativeFilterOptions = getVaccCumulativeFilterOptions(DEFAULT_VACC_DEMO_CUMULATIVE_FILTER)
  readonly cumulativeFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.DEMO_CUMULATIVE_FILTER])
  readonly cumulativeFilter$: Observable<VaccCumulativeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEMO_CUMULATIVE_FILTER, DEFAULT_VACC_DEMO_CUMULATIVE_FILTER),
    tap<VaccCumulativeFilter>(emitValToOwnViewFn(this.cumulativeFilterCtrl, DEFAULT_VACC_DEMO_CUMULATIVE_FILTER)),
  )

  readonly ageRangeFilterOptions: MultiSelectValueOption[] = getEnumValues(AgeRange)
    .map((age): MultiSelectValueOption => ({ value: age, label: replaceHyphenWithEnDash(age) }))
    .reverse()
  readonly ageRangeFilterCtrl = new FormControl(
    readMultiSelectQueryParamValue(
      [...this.ageRangeFilterOptions],
      AgeRange,
      this.route.snapshot.queryParams[QueryParams.DEMO_VIEW_AGE_RANGE_FILTER],
    ),
  )
  readonly ageRangeFilter$: Observable<MultiSelectValueOption[]> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEMO_VIEW_AGE_RANGE_FILTER, null),
    map((val) => readMultiSelectQueryParamValue([...this.ageRangeFilterOptions], AgeRange, val)),
    tap<MultiSelectValueOption[]>(emitValToOwnViewFn(this.ageRangeFilterCtrl)),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.vaccDosesRelativityFilter$,
    this.cumulativeFilter$,
    this.ageRangeFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[relativityFilter, cumulativeFilter, ageRangeFilter], geoUnit]) => {
      const isRel = relativityFilter === VaccinationRelativityFilter.INZ_100
      const ageRanges = ageRangeFilter.map((v) => v.value)
      return {
        geoUnit,
        relativityFilter,
        isRel,
        cumulativeFilter,
        ageRanges,
        timeSpan: this.data.timeSpan,
      }
    }),
    distinctUntilChanged(deepEqual),
    shareReplay(1),
  )
  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))

  readonly demographyData$ = this.currentValues$.pipe(map(this.prepareMatrixData.bind(this)))

  keys: Record<
    'info' | 'descriptionTitle' | 'sourceDesc' | 'metaRel' | 'metaAbs' | 'tooltipRel' | 'tooltipAbs' | 'legendZero',
    string
  >

  override ngOnInit() {
    super.ngOnInit()
    merge(
      this.cumulativeFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.DEMO_CUMULATIVE_FILTER]: v }))),
      this.ageRangeFilterCtrl.valueChanges.pipe(
        map((v: MultiSelectValueOption[]) => createMultiSelectQueryParamValue(v, this.ageRangeFilterOptions)),
        map((v) => ({ [QueryParams.DEMO_VIEW_AGE_RANGE_FILTER]: v })),
      ),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))

    this.cumulativeFilter$
      .pipe(
        takeUntil(this.onDestroy),
        filter((v) => v === VaccCumulativeFilter.WEEKLY),
      )
      .subscribe(() => this.ageRangeFilterCtrl.setValue([...this.ageRangeFilterOptions]))
  }

  demoViewMultiSelectFilterLabelFn: (value: MultiSelectValueOption[]) => string = (value: MultiSelectValueOption[]) => {
    return value.length === this.ageRangeFilterOptions.length
      ? this.translator.get('AgeRangeFilter.AllSelected')
      : this.translator.get('AgeRangeFilter.CountSelected', { count: value.length })
  }

  showMatrixTooltip(
    {
      source,
      data,
    }: MatrixElementEvent<DefinedEntry<DemoMatrixEntry<RefMatrixBucketEntry>, Date, RefMatrixBucketEntry>>,
    isRel: boolean,
  ) {
    const valKey: string = isRel ? this.keys.tooltipRel : this.keys.tooltipAbs
    const isValueDefined = isDefined(data.bucketEntry.value)
    const ctx: TooltipListContentData = {
      title: `${this.translator.get('Vaccination.Card.Demography.Tooltip.Age.Title')} ${replaceHyphenWithEnDash(
        data.bucketEntry.bucketName,
      )}`,
      noData: !isValueDefined,
      entries: [
        {
          label: this.translator.get(valKey),
          value: adminFormatNum(data.bucketEntry.value, isRel ? 2 : undefined),
        },
      ],
      date: this.dateRangeLabel(data.entry.startDate, data.entry.endDate),
    }
    if (isDefined(data.bucketEntry.value) && isDefined(data.bucketEntry.refValue) && ctx.entries) {
      ctx.entries.push({
        label: this.translator.get(isRel ? this.keys.tooltipAbs : this.keys.tooltipRel),
        value: adminFormatNum(data.bucketEntry.refValue, isRel ? undefined : 2),
        lighten: true,
      })
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: 'above',
      offsetY: 12,
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
    const reversePairs = [...histoLegendPairs].reverse()
    const noData = !data.values.some(isDefined)
    const ctx: TooltipListContentData = {
      entries: data.values
        .map((v, ix) => [reversePairs[ix][0], reversePairs[ix][1], v] as const)
        .sort((a, b) => (b[2] || 0) - (a[2] || 0))
        .map((entry) => {
          return {
            label: replaceHyphenWithEnDash(entry[1]),
            value: adminFormatNum(entry[2], isRel ? 2 : undefined),
            color: entry[0],
          }
        }),
      title: formatUtcDate(data.date),
      noData,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after'],
      offsetX: 16,
    })
  }

  showStackTooltip({ source, data }: MatrixElementEvent<DemoMatrixEntry<MatrixBucketEntry>>) {
    const maleBucket = <MatrixBucketEntry>data.buckets.find((b) => b.bucketName === Sex.MALE)
    const femaleBucket = <MatrixBucketEntry>data.buckets.find((b) => b.bucketName === Sex.FEMALE)
    const unknownBucket = data.buckets.find((b) => b.bucketName === Sex.UNKNOWN)
    // order -> male, unknown, female
    const values: TooltipListContentEntry[] = [
      {
        label: this.translator.get('Commons.Male'),
        value: adminFormatNum(maleBucket.value, undefined, '%'),
        color: this.colorMale,
      },
    ]
    if (unknownBucket?.value) {
      values.push({
        label: this.translator.get('Commons.Unknown'),
        value: adminFormatNum(unknownBucket.value, undefined, '%'),
        color: this.colorUnknown,
      })
    }

    values.push({
      label: this.translator.get('Commons.Female'),
      value: adminFormatNum(femaleBucket.value, undefined, '%'),
      color: this.colorFemale,
    })

    const ctx: TooltipListContentData = {
      noCase: data.noCase,
      noCaseKey: this.keys.legendZero,
      noData: data.noData,
      entries: values,
      title: this.dateRangeLabel(new Date(data.startDate), new Date(data.endDate)),
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: 'above',
      offsetY: 16,
    })
  }

  protected init() {
    this.keys = {
      info: 'Vaccination.VaccDoses.Card.Demography.Info',
      descriptionTitle: 'Vaccination.Card.DosesAdministered',
      sourceDesc: 'Vaccination.Card.DosesAdministered',
      metaRel: 'Vaccination.VaccDoses.Card.Demography.Age.Legend.Rel',
      metaAbs: 'Vaccination.VaccDoses.Card.Demography.Age.Legend.Abs',
      tooltipRel: 'Vaccination.VaccDoses.Card.Demography.Tooltip.Rel',
      tooltipAbs: 'Vaccination.VaccDoses.Card.Demography.Tooltip.Abs',
      legendZero: 'Vaccination.VaccDoses.Card.Demography.Legend.Zero',
    }
  }

  protected override prepareDescription({ geoUnit }: { geoUnit: CantonGeoUnit | TopLevelGeoUnit }): string {
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

  private prepareMatrixData(cv: CurrentValues): MatrixData | null {
    const ageMatrixData = createMatrixData(
      this.data.ageData,
      cv.isRel ? GdiVariant.INZ_WEEK : GdiVariant.WEEK,
      cv.isRel ? GdiVariant.WEEK : GdiVariant.INZ_WEEK,
    )
    const genders = [Sex.MALE, Sex.UNKNOWN, Sex.FEMALE]
    const genderData = this.data.genderData.map((gd) => {
      gd.buckets.sort((a, b) => {
        return genders.indexOf(a.bucket) - genders.indexOf(b.bucket)
      })
      return gd
    })
    const genderMatrixData = createSexMatrixData(genderData, GdiVariant.PERCENTAGE, GdiVariant.INZ_WEEK)

    if (ageMatrixData.entries.length === 0 || genderMatrixData.entries.length === 0) {
      return null
    }

    const scaleQuantizeZ = scaleQuantize<string>()
      .domain([ageMatrixData.min, ageMatrixData.max])
      .range(COLORS_VACC_HEATMAP)

    const ageFillFn: HeatmapFillFn<RefMatrixBucketEntry> = (e, svg) => {
      return !isDefined(e.value)
        ? svg.noDataFill
        : e.value > 0
        ? <string>scaleQuantizeZ(e.value)
        : isDefined(e.refValue) && e.refValue > 0
        ? COLORS_VACC_HEATMAP[0]
        : COLOR_NO_CASE
    }

    return {
      isRel: cv.isRel,
      matrixData: {
        age: ageMatrixData,
        gender: genderMatrixData,
        ageFillFn,
      },
      histogramData: this.prepareCumulativeData(cv),
      showCumulative: cv.cumulativeFilter === VaccCumulativeFilter.TOTAL,
      showWeeklyValues: cv.cumulativeFilter === VaccCumulativeFilter.WEEKLY,
    }
  }

  private prepareCumulativeData(cv: CurrentValues): CumulativeChartData {
    // filter selected age ranges
    const ageDataFiltered = filterBucketData(this.data.ageData, cv.ageRanges)
    const { entries: matrixEntries, hasNullValues } = createMatrixData(ageDataFiltered, cv.isRel ? 'inzTotal' : 'total')
    const entries: CumulativeChartEntry[] = (matrixEntries || []).map((entry) => ({
      date: entry.endDate,
      values: entry.buckets.map((bucketEntry) => bucketEntry.value),
    }))
    const leftPadEntries: CumulativeChartEntry[] = matrixEntries
      ? [
          {
            date: matrixEntries[0].startDate,
            values: [],
            forceHideTooltip: true,
          },
        ]
      : []

    const ageHistoColors = filterHistoColors(COLORS_CUMULATIVE, cv.ageRanges, AgeRange)
    const histoLegendPairs = filterHistoLegendPairs(ageHistoColors, cv.ageRanges, AgeRange)

    return {
      data: [...leftPadEntries, ...entries],
      hasNullValues,
      ageHistoColors,
      histoLegendPairs,
    }
  }
}
