import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  AgeBucketData,
  AgeRange,
  CantonGeoUnit,
  EpidemiologicDemographyData,
  GenderBucketData,
  isDefined,
  Sex,
  TimeSpan,
  TopLevelGeoUnit,
} from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { scaleQuantize } from 'd3'
import { addDays } from 'date-fns'
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
import { MatrixBucketEntry, MatrixElementEvent } from '../../diagrams/matrix/base-matrix.component'
import { DefinedEntry, HeatmapFillFn } from '../../diagrams/matrix/matrix-heatmap/matrix-heatmap.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_FEMALE,
  COLOR_MALE,
  COLOR_NO_CASE,
  COLOR_UNKNOWN,
  COLORS_CUMULATIVE,
  COLORS_MATRIX_HEATMAP_SCALE,
  COLORS_MATRIX_STACK,
} from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { DemoMatrixEntry } from '../../shared/models/demo-matrix-entry.model'
import {
  DEFAULT_DEMO_VIEW_FILTER,
  DemoViewFilter,
  getDemoViewFilterOptions,
} from '../../shared/models/filters/demo-view-filter.enum'
import {
  DEFAULT_RELATIVITY_FILTER,
  getInz100KAbsFilterOptions,
  Inz100KAbsFilter,
} from '../../shared/models/filters/relativity/inz100k-abs-filter.enum'
import { TimeSlotFilter, timeSlotFilterTimeFrameKey } from '../../shared/models/filters/time-slot-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { TwoWeeksDemographyData } from '../../shared/models/two-weeks-demography-data.model'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import {
  createMatrixData,
  get2WeeksDemographyData,
  getTimeslotCorrespondingWeeklyValues,
  MatrixCreationData,
} from '../../static-utils/data-utils'
import { formatUtcDate } from '../../static-utils/date-utils'
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
import { BaseDetailEpidemiologicCardComponent, CurrentValuesBase } from '../base-detail-epidemiologic-card.component'

interface ExtHistogramLineEntry extends HistogramLineEntry {
  startDate: Date | null
  endDate: Date | null
}

interface CurrentDemographyValues extends CurrentValuesBase {
  geoUnit: CantonGeoUnit | TopLevelGeoUnit
  timeFilter: TimeSlotFilter
  view: DemoViewFilter
  relativityFilter: Inz100KAbsFilter
  isInz: boolean
  timeFrame: TimeSpan
  ageData: AgeBucketData[]
  genderData: GenderBucketData[]
  ageRanges: string[]
}

interface MatrixDemographyData {
  view: DemoViewFilter
  ageHistoEntries: ExtHistogramLineEntry[]
  ageHistoColors: string[]
  histoLegendPairs: [string, string][]
  ageSkipNoDataBefore: Date
  age: MatrixCreationData<MatrixBucketEntry>
  gender: MatrixCreationData<MatrixBucketEntry>
  ageFillFn: HeatmapFillFn
  isInz: boolean
}

@Component({
  selector: 'bag-detail-card-epidemiologic-demography',
  templateUrl: './detail-card-epidemiologic-demography.component.html',
  styleUrls: ['./detail-card-epidemiologic-demography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardEpidemiologicDemographyComponent
  extends BaseDetailEpidemiologicCardComponent<EpidemiologicDemographyData>
  implements OnInit
{
  readonly DemoViewFilter = DemoViewFilter
  readonly demoViewFilterOptions = getDemoViewFilterOptions()
  readonly demoViewFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.DEMO_VIEW_FILTER] || null)
  readonly demoViewFilter$: Observable<DemoViewFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEMO_VIEW_FILTER, DEFAULT_DEMO_VIEW_FILTER),
    tap<DemoViewFilter>(emitValToOwnViewFn(this.demoViewFilterCtrl, DEFAULT_DEMO_VIEW_FILTER)),
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

  readonly relativityFilterOptions = getInz100KAbsFilterOptions(DEFAULT_RELATIVITY_FILTER)
  readonly relativityFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.EPI_REL_ABS_DEMOGRAPHY_FILTER] || null,
  )
  readonly relFilter$: Observable<Inz100KAbsFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.EPI_REL_ABS_DEMOGRAPHY_FILTER, DEFAULT_RELATIVITY_FILTER),
  )

  readonly currentValues$: Observable<CurrentDemographyValues> = combineLatest([
    this.timeFilter$,
    this.relFilter$,
    this.demoViewFilter$,
    this.ageRangeFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[timeFilter, relativityFilter, demoView, ageRangeFilter], geoUnit]): CurrentDemographyValues => {
      const timeFrame = this.data.timeframes[timeSlotFilterTimeFrameKey[timeFilter]]
      const ageRanges = ageRangeFilter.map((v) => v.value)
      const genders = [Sex.MALE, Sex.UNKNOWN, Sex.FEMALE]
      return {
        geoUnit,
        timeFilter,
        relativityFilter,
        view: timeFilter === TimeSlotFilter.LAST_2_WEEKS ? DemoViewFilter.HEATMAP : demoView,
        isInz: relativityFilter === Inz100KAbsFilter.INZ_100K,
        timeFrame,
        ageRanges,
        ageData: getTimeslotCorrespondingWeeklyValues(this.data.ageData, timeFrame),
        genderData: getTimeslotCorrespondingWeeklyValues(this.data.genderData, timeFrame).map((gd) => {
          gd.buckets.sort((a, b) => {
            return genders.indexOf(a.bucket) - genders.indexOf(b.bucket)
          })
          return gd
        }),
      }
    }),
    distinctUntilChanged(deepEqual),
    shareReplay(1),
  )
  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))
  readonly demographyData$ = this.currentValues$.pipe(map(this.prepareDemographyData.bind(this)))
  readonly demographyTwoWeeks$ = this.currentValues$.pipe(map(this.prepare2WeeksDemographyData.bind(this)))

  readonly cardDetailPath = RoutePaths.SHARE_DEMOGRAPHY
  readonly stackColors = COLORS_MATRIX_STACK
  readonly heatmapScaleColors = COLORS_MATRIX_HEATMAP_SCALE

  readonly matrixYLabelFmt = replaceHyphenWithEnDash

  ngOnInit() {
    merge(
      this.demoViewFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.DEMO_VIEW_FILTER]: v }))),
      this.relativityFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.EPI_REL_ABS_DEMOGRAPHY_FILTER]: v }))),
      this.ageRangeFilterCtrl.valueChanges.pipe(
        map((v: MultiSelectValueOption[]) => createMultiSelectQueryParamValue(v, this.ageRangeFilterOptions)),
        map((v) => ({ [QueryParams.DEMO_VIEW_AGE_RANGE_FILTER]: v })),
      ),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))

    this.demoViewFilter$
      .pipe(
        takeUntil(this.onDestroy),
        filter((v) => v === DemoViewFilter.HEATMAP),
      )
      .subscribe(() => this.ageRangeFilterCtrl.setValue([...this.ageRangeFilterOptions]))
  }

  initCard(topic: string) {
    this.titleKey = `DetailCardDemography.Title`
    this.infoKey = `DetailCardDemography.InfoText.${topic}`
  }

  demoViewMultiSelectFilterLabelFn: (value: MultiSelectValueOption[]) => string = (value: MultiSelectValueOption[]) => {
    return value.length === this.ageRangeFilterOptions.length
      ? this.translator.get('AgeRangeFilter.AllSelected')
      : this.translator.get('AgeRangeFilter.CountSelected', { count: value.length })
  }

  showMatrixTooltip({ source, data }: MatrixElementEvent<DefinedEntry<DemoMatrixEntry, Date>>, isInz: boolean) {
    const valKey: string = isInz ? this.tooltipInzKey : this.tooltipAbsKey

    const ctx: TooltipListContentData = {
      title: `${this.translator.get('DetailCardDemography.Chart.AgeBucket')} ${data.bucketEntry.bucketName}`,
      noData: data.bucketEntry.value === null,
      noCase: data.bucketEntry.value === 0,
      noCaseKey: this.legendZeroKey,
      entries: [{ label: this.translator.get(valKey), value: adminFormatNum(data.bucketEntry.value) }],
      date: this.dateRangeLabel(data.entry.startDate, data.entry.endDate),
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: 'above',
      offsetY: 12,
    })
  }

  showStackTooltip({ source, data }: MatrixElementEvent<DemoMatrixEntry>) {
    const maleBucket = <MatrixBucketEntry>data.buckets.find((b) => b.bucketName === Sex.MALE)
    const femaleBucket = <MatrixBucketEntry>data.buckets.find((b) => b.bucketName === Sex.FEMALE)
    const unknownBucket = data.buckets.find((b) => b.bucketName === Sex.UNKNOWN)
    // order -> male, unknown, female
    const entries: TooltipListContentEntry[] = [
      {
        label: this.translator.get('Commons.Male'),
        value: adminFormatNum(maleBucket.value, undefined, '%'),
        color: COLOR_MALE,
      },
    ]
    if (unknownBucket?.value) {
      entries.push({
        label: this.translator.get('Commons.Unknown'),
        value: adminFormatNum(unknownBucket.value, undefined, '%'),
        color: COLOR_UNKNOWN,
      })
    }

    entries.push({
      label: this.translator.get('Commons.Female'),
      value: adminFormatNum(femaleBucket.value, undefined, '%'),
      color: COLOR_FEMALE,
    })

    const ctx: TooltipListContentData = {
      noCase: data.noCase,
      noCaseKey: this.legendZeroKey,
      noData: data.noData,
      entries,
      title: this.dateRangeLabel(new Date(data.startDate), new Date(data.endDate)),
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: 'above',
      offsetY: 16,
    })
  }

  showHistoTooltip(
    { source, data }: HistogramElFocusEvent<ExtHistogramLineEntry>,
    isInz: boolean,
    histoLegendPairs: [string, string][],
  ) {
    if (!data.startDate || !data.endDate) {
      return this.hideTooltip()
    }

    const reversePairs = [...histoLegendPairs].reverse()
    const noData = !data.values.some(isDefined)
    const ctx: TooltipListContentData = {
      title: this.dateRangeLabel(data.startDate, data.endDate),
      noData,
      entries: noData
        ? []
        : data.values
            .map((v, ix) => [reversePairs[ix][0], reversePairs[ix][1], v] as const)
            .sort((a, b) => (b[2] || 0) - (a[2] || 0))
            .map((entry) => {
              return {
                label: replaceHyphenWithEnDash(entry[1]),
                value: adminFormatNum(entry[2], isInz ? 2 : undefined),
                color: entry[0],
              }
            }),
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after'],
      offsetX: 16,
    })
  }

  private prepareDemographyData(currValues: CurrentDemographyValues): MatrixDemographyData | null {
    const { isInz, timeFilter, ageData, genderData, ageRanges, view } = currValues
    if (timeFilter === TimeSlotFilter.LAST_2_WEEKS) {
      return null
    }

    // filter selected age ranges for GRAPH view only
    const ageDataFiltered = view === DemoViewFilter.GRAPH ? filterBucketData(ageData, ageRanges) : ageData
    const age = createMatrixData(ageDataFiltered, isInz ? 'inzWeek' : 'week')
    const gender = createMatrixData(genderData, 'percentage')

    if (age.entries.length === 0 || gender.entries.length === 0) {
      return null
    }
    const ageHistoColors = filterHistoColors(COLORS_CUMULATIVE, ageRanges, AgeRange)
    const histoLegendPairs = filterHistoLegendPairs(ageHistoColors, ageRanges, AgeRange)

    const scaleQuantizeZ = scaleQuantize<string>().domain([age.min, age.max]).range(COLORS_MATRIX_HEATMAP_SCALE)
    const ageFillFn: HeatmapFillFn = (e, svg) => {
      return !isDefined(e.value) ? svg.noDataFill : e.value > 0 ? <string>scaleQuantizeZ(e.value) : COLOR_NO_CASE
    }

    const ageHistoEntries: ExtHistogramLineEntry[] = age.entries.map((entry) => ({
      startDate: entry.startDate,
      endDate: entry.endDate,
      date: entry.endDate,
      values: entry.buckets.map((bucketEntry) => bucketEntry.value),
    }))
    ageHistoEntries.unshift({ date: age.entries[0].startDate, values: [], startDate: null, endDate: null })

    return {
      view: currValues.view,
      age,
      ageHistoEntries,
      ageHistoColors,
      histoLegendPairs,
      ageSkipNoDataBefore: addDays(age.entries[0].startDate, 1),
      gender,
      isInz,
      ageFillFn,
    }
  }

  private prepare2WeeksDemographyData(currValues: CurrentDemographyValues): TwoWeeksDemographyData | null {
    const { isInz, timeFilter, ageData, genderData } = currValues
    if (timeFilter !== TimeSlotFilter.LAST_2_WEEKS) {
      return null
    }
    return get2WeeksDemographyData(ageData, isInz, genderData, this.translator)
  }

  private dateRangeLabel(startDate: Date, endDate: Date): string {
    return this.translator.get('Commons.DateToDate', {
      date1: formatUtcDate(startDate),
      date2: formatUtcDate(endDate),
    })
  }
}
