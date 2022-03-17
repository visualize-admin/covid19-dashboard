import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
  AgeRange,
  AgeRangeByVaccinationStrategy,
  CantonGeoUnit,
  EpidemiologicVaccDemographyDataV2,
  GdiSubset,
  GdiVariant,
  isDefined,
  Sex,
  TopLevelGeoUnit,
  VaccinationPersonsAgeBucketData,
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
import { TranslatorService } from '../../core/i18n/translator.service'
import { UriService } from '../../core/uri.service'
import { DistributionBarEntries } from '../../diagrams/distribution-bar/distribution-bar.component'
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
  COLOR_VACC_PERSONS_BOOSTER,
  COLOR_VACC_PERSONS_BOOSTER_PATTERN,
  COLOR_VACC_PERSONS_FULL,
  COLOR_VACC_PERSONS_MIN_ONE,
  COLOR_VACC_PERSONS_NOT_VACCINATED,
  COLORS_CUMULATIVE,
  COLORS_CUMULATIVE_VACC_STRATEGY,
  COLORS_VACC_HEATMAP,
} from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import { RefMatrixBucketEntry } from '../../shared/models/demo-matrix-entry.model'
import {
  DEFAULT_VACC_AGE_GROUP_CLASSIFICATION_FILTER,
  getVaccAgeGroupClassificationFilterOptions,
  VaccAgeGroupClassificationFilter,
} from '../../shared/models/filters/vacc-age-group-classification-filter.enum'
import {
  DEFAULT_VACC_DEMO_CUMULATIVE_FILTER,
  getVaccCumulativeFilterOptions,
  VaccCumulativeFilter,
} from '../../shared/models/filters/vacc-cumulative-filter.enum'
import {
  DEFAULT_VACC_PERSONS_AGE_DEMO_FILTER,
  DEFAULT_VACC_PERSONS_SEX_DEMO_FILTER,
  getVaccPersonsDemoFilterOptions,
  VaccPersonsDemoFilter,
} from '../../shared/models/filters/vacc-persons-demo-filter.enum'
import { RelAbsFilter } from '../../shared/models/filters/relativity/rel-abs-filter.enum'
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
  cumulativeFilter: VaccCumulativeFilter
  vaccPersonsAgeFilter: VaccPersonsDemoFilter
  vaccPersonsSexFilter: VaccPersonsDemoFilter
  vaccAgeGroupClassificationFilter: VaccAgeGroupClassificationFilter
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
  infoBoxData: AgeInfoBoxData
  isRel: boolean

  showCumulative: boolean
  showWeeklyValues: boolean
  ageKeys: {
    legendKey: string
    legendNoCasesKey: string
    tooltipKey: string
  }
  sexKeys: {
    legendNoCasesKey: string
    tooltipKey: string
  }
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

interface AgeInfoBoxBucket {
  name: string
  distribution: DistributionBarEntries
  full: number | null
  partial: number | null
  booster: number | null
}

interface AgeInfoBoxData {
  title: string
  subTitle: string | null
  histoLegendPairs: [string, string, boolean][]
  buckets: AgeInfoBoxBucket[]
  byVaccStrategy: boolean
}

@Component({
  selector: 'bag-detail-card-vacc-persons-demography',
  templateUrl: './detail-card-vacc-persons-demography.component.html',
  styleUrls: ['./detail-card-vacc-persons-demography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVaccPersonsDemographyComponent
  extends BaseDetailCardVaccinationComponent<EpidemiologicVaccDemographyDataV2>
  implements OnInit
{
  @Input()
  isDetailPage?: boolean

  readonly colorBooster = COLOR_VACC_PERSONS_BOOSTER

  readonly cardDetailPath = RoutePaths.SHARE_DEMOGRAPHY
  readonly colorMale = COLOR_MALE_VACC
  readonly colorFemale = COLOR_FEMALE_VACC
  readonly colorUnknown = COLOR_UNKNOWN_VACC
  readonly heatmapScaleColors = COLORS_VACC_HEATMAP
  readonly stackColors = [COLOR_MALE_VACC, COLOR_UNKNOWN_VACC, COLOR_FEMALE_VACC]

  readonly cumulativeFilterOptions = getVaccCumulativeFilterOptions(DEFAULT_VACC_DEMO_CUMULATIVE_FILTER)
  readonly cumulativeFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.DEMO_CUMULATIVE_FILTER])
  readonly cumulativeFilter$: Observable<VaccCumulativeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEMO_CUMULATIVE_FILTER, DEFAULT_VACC_DEMO_CUMULATIVE_FILTER),
    tap<VaccCumulativeFilter>(emitValToOwnViewFn(this.cumulativeFilterCtrl, DEFAULT_VACC_DEMO_CUMULATIVE_FILTER)),
  )

  readonly ageGroupClassificationFilterOptions = getVaccAgeGroupClassificationFilterOptions(
    DEFAULT_VACC_AGE_GROUP_CLASSIFICATION_FILTER,
  )
  readonly ageGroupClassificationFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.AGE_GROUP_CLASSIFICATION_FILTER],
  )
  readonly ageGroupClassificationFilter$: Observable<VaccAgeGroupClassificationFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.AGE_GROUP_CLASSIFICATION_FILTER, DEFAULT_VACC_AGE_GROUP_CLASSIFICATION_FILTER),
    tap<VaccAgeGroupClassificationFilter>(
      emitValToOwnViewFn(this.ageGroupClassificationFilterCtrl, DEFAULT_VACC_AGE_GROUP_CLASSIFICATION_FILTER),
    ),
  )

  readonly vaccPersonsAgeFilterOptions = getVaccPersonsDemoFilterOptions(DEFAULT_VACC_PERSONS_AGE_DEMO_FILTER)
  readonly vaccPersonsAgeFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.DEMO_AGE_FILTER])
  readonly vaccPersonsAgeFilter$: Observable<VaccPersonsDemoFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEMO_AGE_FILTER, DEFAULT_VACC_PERSONS_AGE_DEMO_FILTER),
    tap<VaccPersonsDemoFilter>(emitValToOwnViewFn(this.vaccPersonsAgeFilterCtrl, DEFAULT_VACC_PERSONS_AGE_DEMO_FILTER)),
  )

  readonly vaccPersonsSexFilterOptions = getVaccPersonsDemoFilterOptions(DEFAULT_VACC_PERSONS_SEX_DEMO_FILTER)
  readonly vaccPersonsSexFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.DEMO_SEX_FILTER])
  readonly vaccPersonsSexFilter$: Observable<VaccPersonsDemoFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEMO_SEX_FILTER, DEFAULT_VACC_PERSONS_SEX_DEMO_FILTER),
    tap<VaccPersonsDemoFilter>(emitValToOwnViewFn(this.vaccPersonsSexFilterCtrl, DEFAULT_VACC_PERSONS_SEX_DEMO_FILTER)),
  )

  ageRangeFilterOptions: MultiSelectValueOption[] = this.filterSpecificAgeRangeOptions(
    !!this.route.snapshot.queryParams[QueryParams.AGE_GROUP_CLASSIFICATION_FILTER],
  )

  readonly ageRangeFilterCtrl = new FormControl(
    readMultiSelectQueryParamValue(
      [...this.ageRangeFilterOptions],
      this.route.snapshot.queryParams[QueryParams.AGE_GROUP_CLASSIFICATION_FILTER]
        ? AgeRangeByVaccinationStrategy
        : AgeRange,
      this.route.snapshot.queryParams[QueryParams.DEMO_VIEW_AGE_RANGE_FILTER],
    ),
  )
  readonly ageRangeFilter$: Observable<MultiSelectValueOption[]> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEMO_VIEW_AGE_RANGE_FILTER, null),
    withLatestFrom(this.ageGroupClassificationFilter$),
    map(([val, ageGroupClassificationFilter]) =>
      readMultiSelectQueryParamValue(
        [...this.ageRangeFilterOptions],
        DetailCardVaccPersonsDemographyComponent.filterSpecificAgeRangeEnum(ageGroupClassificationFilter),
        val,
      ),
    ),
    tap<MultiSelectValueOption[]>(emitValToOwnViewFn(this.ageRangeFilterCtrl)),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.vaccPersonsRelativityFilter$,
    this.cumulativeFilter$,
    this.vaccPersonsAgeFilter$,
    this.vaccPersonsSexFilter$,
    this.ageRangeFilter$,
    this.ageGroupClassificationFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(
      ([
        [
          relativityFilter,
          cumulativeFilter,
          vaccPersonsAgeFilter,
          vaccPersonsSexFilter,
          _,
          vaccAgeGroupClassificationFilter,
        ],
        geoUnit,
      ]) => {
        const isRel = relativityFilter === RelAbsFilter.RELATIVE
        const ageRanges = this.ageRangeFilterCtrl.value.map((v: MultiSelectValueOption) => v.value)

        return {
          geoUnit,
          relativityFilter,
          isRel,
          cumulativeFilter,
          ageRanges,
          vaccPersonsAgeFilter,
          vaccPersonsSexFilter,
          timeSpan: this.data.timeSpan,
          vaccAgeGroupClassificationFilter,
        }
      },
    ),
    distinctUntilChanged(deepEqual),
    shareReplay(1),
  )
  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))

  readonly demographyData$ = this.currentValues$.pipe(map(this.prepareMatrixData.bind(this)))

  keys: Record<
    | 'info'
    | 'descriptionTitle'
    | 'metaFullRel'
    | 'metaFullAbs'
    | 'metaMinOneRel'
    | 'metaMinOneAbs'
    | 'metaBoosterRel'
    | 'metaBoosterAbs'
    | 'tooltipFull'
    | 'tooltipMinOne'
    | 'tooltipBooster'
    | 'legendFullZero'
    | 'legendMinOneZero'
    | 'legendBoosterZero',
    string
  >

  private static filterSpecificAgeRangeEnum(f: VaccAgeGroupClassificationFilter) {
    return f === VaccAgeGroupClassificationFilter.AKL_10 ? AgeRange : AgeRangeByVaccinationStrategy
  }

  constructor(
    route: ActivatedRoute,
    router: Router,
    translator: TranslatorService,
    uriService: UriService,
    tooltipService: TooltipService,
  ) {
    super(route, router, translator, uriService, tooltipService)
  }

  override ngOnInit() {
    super.ngOnInit()
    merge(
      this.cumulativeFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.DEMO_CUMULATIVE_FILTER]: v }))),
      this.vaccPersonsAgeFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.DEMO_AGE_FILTER]: v }))),
      this.vaccPersonsSexFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.DEMO_SEX_FILTER]: v }))),
      this.ageGroupClassificationFilterCtrl.valueChanges.pipe(
        map((v) => ({ [QueryParams.AGE_GROUP_CLASSIFICATION_FILTER]: v })),
      ),
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
      .subscribe(() => {
        this.ageRangeFilterOptions = this.filterSpecificAgeRangeOptions(
          !!this.route.snapshot.queryParams[QueryParams.AGE_GROUP_CLASSIFICATION_FILTER],
        )
        this.ageRangeFilterCtrl.setValue([...this.ageRangeFilterOptions])
      })

    this.ageGroupClassificationFilter$.pipe(takeUntil(this.onDestroy)).subscribe((v) => {
      this.ageRangeFilterOptions = this.filterSpecificAgeRangeOptions(
        v === VaccAgeGroupClassificationFilter.VACC_STRATEGY,
      )
      this.ageRangeFilterCtrl.setValue(
        readMultiSelectQueryParamValue(
          [...this.ageRangeFilterOptions],
          v === VaccAgeGroupClassificationFilter.VACC_STRATEGY ? AgeRangeByVaccinationStrategy : AgeRange,
          this.route.snapshot.queryParams[QueryParams.DEMO_VIEW_AGE_RANGE_FILTER],
        ),
      )
    })
  }

  readonly yLabelFmt = (val: number) => `${val}%`

  readonly matrixYLabelFmt = (v: string) => {
    const translation = this.translator.tryGet(`AgeRangeByVaccinationStrategy.${v}`) || v
    return replaceHyphenWithEnDash(translation)
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
    tooltipKey: string,
  ) {
    const isValueDefined = isDefined(data.bucketEntry.value)
    const ctx: TooltipListContentData = {
      title: `${this.translator.get('Vaccination.Card.Demography.Tooltip.Age.Title')} ${this.matrixYLabelFmt(
        data.bucketEntry.bucketName,
      )}`,
      date: this.dateRangeLabel(data.entry.startDate, data.entry.endDate),
      noData: !isValueDefined,
      entries: [
        {
          label: this.translator.get(tooltipKey),
          value: adminFormatNum(data.bucketEntry.value, isRel ? 2 : undefined, isRel ? '%' : undefined),
        },
      ],
    }
    if (isDefined(data.bucketEntry.value) && isDefined(data.bucketEntry.refValue) && ctx.entries) {
      ctx.entries.push({
        label: this.translator.get(tooltipKey),
        value: adminFormatNum(data.bucketEntry.refValue, isRel ? undefined : 2, isRel ? undefined : '%'),
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
    noCaseKey: string,
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
            label: this.matrixYLabelFmt(entry[1]),
            value: adminFormatNum(entry[2], isRel ? 2 : undefined, isRel ? '%' : undefined),
            color: entry[0],
          }
        }),
      title: formatUtcDate(data.date),
      noData,
    }
    // tslint:disable-next-line:no-non-null-assertion
    if (ctx.entries!.length === 0) {
      ctx.noCase = true
      ctx.noCaseKey = noCaseKey
    }

    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after'],
      offsetX: 16,
    })
  }

  showStackTooltip({ source, data }: MatrixElementEvent<DemoMatrixEntry<MatrixBucketEntry>>, noCasesKey: string) {
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
      title: this.dateRangeLabel(new Date(data.startDate), new Date(data.endDate)),
      noCase: data.noCase,
      noCaseKey: noCasesKey,
      noData: data.noData,
      entries: values,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: 'above',
      offsetY: 16,
    })
  }

  protected init() {
    this.keys = {
      info: 'Vaccination.VaccPersons.Card.Demography.Info',
      descriptionTitle: 'Vaccination.VaccPersons.DetailTitle',
      metaFullRel: 'Vaccination.VaccPersons.Card.Demography.Age.Legend.Full.Rel',
      metaFullAbs: 'Vaccination.VaccPersons.Card.Demography.Age.Legend.Full.Abs',
      metaMinOneRel: 'Vaccination.VaccPersons.Card.Demography.Age.Legend.MinOne.Rel',
      metaMinOneAbs: 'Vaccination.VaccPersons.Card.Demography.Age.Legend.MinOne.Abs',
      metaBoosterRel: 'Vaccination.VaccPersons.Card.Demography.Age.Legend.Booster.Rel',
      metaBoosterAbs: 'Vaccination.VaccPersons.Card.Demography.Age.Legend.Booster.Abs',
      tooltipFull: 'Vaccination.VaccPersons.Card.Demography.Tooltip.Full',
      tooltipMinOne: 'Vaccination.VaccPersons.Card.Demography.Tooltip.MinOne',
      tooltipBooster: 'Vaccination.VaccPersons.Card.Demography.Tooltip.Booster',
      legendFullZero: 'Vaccination.VaccPersons.Card.Demography.Legend.Full.Zero',
      legendMinOneZero: 'Vaccination.VaccPersons.Card.Demography.Legend.MinOne.Zero',
      legendBoosterZero: 'Vaccination.VaccPersons.Card.Demography.Legend.Booster.Zero',
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
    let targetAgeGdiSubset:
      | GdiSubset.VACC_PERSONS_FULL
      | GdiSubset.VACC_PERSONS_MIN_ONE_DOSE
      | GdiSubset.VACC_PERSONS_FIRST_BOOSTER

    const ageKeys = {
      legendKey: '',
      legendNoCasesKey: '',
      tooltipKey: '',
    }

    switch (cv.vaccPersonsAgeFilter) {
      case VaccPersonsDemoFilter.FULL:
        targetAgeGdiSubset = GdiSubset.VACC_PERSONS_FULL
        ageKeys.legendKey = cv.isRel ? this.keys.metaFullRel : this.keys.metaFullAbs
        ageKeys.legendNoCasesKey = this.keys.legendFullZero
        ageKeys.tooltipKey = this.keys.tooltipFull
        break
      case VaccPersonsDemoFilter.MIN_ONE:
        targetAgeGdiSubset = GdiSubset.VACC_PERSONS_MIN_ONE_DOSE
        ageKeys.legendKey = cv.isRel ? this.keys.metaMinOneRel : this.keys.metaMinOneAbs
        ageKeys.legendNoCasesKey = this.keys.legendMinOneZero
        ageKeys.tooltipKey = this.keys.tooltipMinOne
        break
      case VaccPersonsDemoFilter.BOOSTER:
        targetAgeGdiSubset = GdiSubset.VACC_PERSONS_FIRST_BOOSTER
        ageKeys.legendKey = cv.isRel ? this.keys.metaBoosterRel : this.keys.metaBoosterAbs
        ageKeys.legendNoCasesKey = this.keys.legendBoosterZero
        ageKeys.tooltipKey = this.keys.tooltipBooster
        break
    }

    const isAkl10 = cv.vaccAgeGroupClassificationFilter === VaccAgeGroupClassificationFilter.AKL_10

    const ageRanges = isAkl10 ? getEnumValues(AgeRange) : getEnumValues(AgeRangeByVaccinationStrategy)
    const targetAgeData: VaccinationPersonsAgeBucketData[] = this.data.ageData
      .filter((e) => !e.incompleteWeek)
      .map((entry) => {
        const targetBuckets = entry.buckets
          .filter((b) => ageRanges.includes(b.bucket))
          .map((bucket) => ({ bucket: bucket.bucket, ...bucket[targetAgeGdiSubset] }))
        return { ...entry, buckets: isAkl10 ? targetBuckets : targetBuckets.reverse() }
      })
    const ageMatrixData = createMatrixData(
      targetAgeData,
      cv.isRel ? GdiVariant.INZ_WEEK : GdiVariant.WEEK,
      cv.isRel ? GdiVariant.WEEK : GdiVariant.INZ_WEEK,
    )

    const sexKeys = {
      legendNoCasesKey: '',
      tooltipKey: '',
    }

    let targetSexGdiSubset:
      | GdiSubset.VACC_PERSONS_FULL
      | GdiSubset.VACC_PERSONS_MIN_ONE_DOSE
      | GdiSubset.VACC_PERSONS_FIRST_BOOSTER
    switch (cv.vaccPersonsSexFilter) {
      case VaccPersonsDemoFilter.FULL:
        targetSexGdiSubset = GdiSubset.VACC_PERSONS_FULL
        sexKeys.legendNoCasesKey = this.keys.legendFullZero
        sexKeys.tooltipKey = this.keys.tooltipFull
        break
      case VaccPersonsDemoFilter.MIN_ONE:
        targetSexGdiSubset = GdiSubset.VACC_PERSONS_MIN_ONE_DOSE
        sexKeys.legendNoCasesKey = this.keys.legendMinOneZero
        sexKeys.tooltipKey = this.keys.tooltipMinOne
        break
      case VaccPersonsDemoFilter.BOOSTER:
        targetSexGdiSubset = GdiSubset.VACC_PERSONS_FIRST_BOOSTER
        sexKeys.legendNoCasesKey = this.keys.legendBoosterZero
        sexKeys.tooltipKey = this.keys.tooltipBooster
        break
    }

    const genders = [Sex.MALE, Sex.UNKNOWN, Sex.FEMALE]
    const targetGenderData = this.data.genderData.map((entry) => {
      const targetBuckets = entry.buckets
        .map((bucket) => ({ bucket: bucket.bucket, ...bucket[targetSexGdiSubset] }))
        .sort((a, b) => {
          return genders.indexOf(a.bucket) - genders.indexOf(b.bucket)
        })
      return { ...entry, buckets: targetBuckets }
    })
    const genderMatrixData = createSexMatrixData(targetGenderData, GdiVariant.PERCENTAGE, GdiVariant.INZ_WEEK)

    if (ageMatrixData.entries.length === 0 || genderMatrixData.entries.length === 0) {
      return null
    }

    const latestEntry = this.data.ageData[this.data.ageData.length - 1]

    const infoBoxData: AgeInfoBoxData = {
      title: this.translator.get(`GeoFilter.${cv.geoUnit}`),
      subTitle: latestEntry.incompleteWeek
        ? this.translator.get('Commons.DateStatus', { date: formatUtcDate(parseIsoDate(latestEntry.end)) })
        : null,
      byVaccStrategy: cv.vaccAgeGroupClassificationFilter === VaccAgeGroupClassificationFilter.VACC_STRATEGY,
      histoLegendPairs: [
        [COLOR_VACC_PERSONS_FULL, 'Vaccination.Card.VaccPersons.WithBooster', true],
        [COLOR_VACC_PERSONS_FULL, 'Vaccination.Card.VaccPersons.Full', false],
        [COLOR_VACC_PERSONS_MIN_ONE, 'Vaccination.Card.VaccPersons.Partial', false],
      ],
      buckets: latestEntry.buckets
        .filter((b) => ageRanges.includes(b.bucket))
        .map((bucket) => {
          const full = bucket[GdiSubset.VACC_PERSONS_FULL].inzTotal
          const partial = bucket[GdiSubset.VACC_PERSONS_PARTIAL].inzTotal
          const minOne = bucket[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].inzTotal
          const booster = bucket[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].inzTotal
          return {
            name:
              cv.vaccAgeGroupClassificationFilter === VaccAgeGroupClassificationFilter.AKL_10
                ? bucket.bucket
                : this.translator.get(`AgeRangeByVaccinationStrategy.${bucket.bucket}`),
            full,
            partial,
            booster,
            distribution: [
              {
                ratio: booster,
                colorCode: COLOR_VACC_PERSONS_FULL,
                patternColorCode: COLOR_VACC_PERSONS_BOOSTER_PATTERN,
                isOverlay: true,
              },
              { ratio: full, colorCode: COLOR_VACC_PERSONS_FULL },
              { ratio: partial, colorCode: COLOR_VACC_PERSONS_MIN_ONE },
              { ratio: 100 - (minOne || 0), colorCode: COLOR_VACC_PERSONS_NOT_VACCINATED },
            ],
          }
        }),
    }
    if (isAkl10) {
      infoBoxData.buckets.reverse()
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
      histogramData: this.prepareCumulativeData(cv, targetAgeData),
      showCumulative: cv.cumulativeFilter === VaccCumulativeFilter.TOTAL,
      showWeeklyValues: cv.cumulativeFilter === VaccCumulativeFilter.WEEKLY,
      infoBoxData,
      ageKeys,
      sexKeys,
    }
  }

  private prepareCumulativeData(
    cv: CurrentValues,
    targetAgeData: VaccinationPersonsAgeBucketData[],
  ): CumulativeChartData {
    // filter selected age ranges
    const isAkl10 = cv.vaccAgeGroupClassificationFilter === VaccAgeGroupClassificationFilter.AKL_10
    const ageDataFiltered = filterBucketData(targetAgeData, cv.ageRanges)

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

    const ageHistoColors = filterHistoColors(
      isAkl10 ? COLORS_CUMULATIVE : COLORS_CUMULATIVE_VACC_STRATEGY,
      cv.ageRanges,
      isAkl10 ? AgeRange : AgeRangeByVaccinationStrategy,
    )
    const histoLegendPairs = filterHistoLegendPairs(
      ageHistoColors,
      cv.ageRanges,
      isAkl10 ? AgeRange : AgeRangeByVaccinationStrategy,
    )

    if (!isAkl10) {
      ageHistoColors.reverse()
      histoLegendPairs.reverse()
      histoLegendPairs.forEach((p) => {
        p[1] = this.translator.get(`AgeRangeByVaccinationStrategy.${p[1]}`)
      })
    }

    return {
      data: [...leftPadEntries, ...entries],
      hasNullValues,
      ageHistoColors,
      histoLegendPairs,
    }
  }

  private filterSpecificAgeRangeOptions(byVaccStrategy: boolean): MultiSelectValueOption[] {
    return byVaccStrategy
      ? getEnumValues(AgeRangeByVaccinationStrategy).map(
          (age): MultiSelectValueOption => ({
            value: age,
            label: this.translator.get(`AgeRangeByVaccinationStrategy.${age}`),
          }),
        )
      : getEnumValues(AgeRange)
          .map((age): MultiSelectValueOption => ({ value: age, label: replaceHyphenWithEnDash(age) }))
          .reverse()
  }
}
