import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  EpidemiologicVaccSymptomsDemographyData,
  EpidemiologicVaccSymptomsDemographyEntry,
  EpidemiologicVaccSymptomsTimelineEntry,
  GdiSubset,
  GdiVariant,
  isDefined,
  VaccSymptomsAgeRange,
} from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { combineLatest, Observable } from 'rxjs'
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
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLORS_SYMPTOMS_AGE_RANGE, COLORS_VACC_HEATMAP } from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { deepEqual } from '../../static-utils/deep-equal.function'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import {
  createMultiSelectQueryParamValue,
  filterHistoColors,
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
  ageRanges: VaccSymptomsAgeRange[]
}

interface CumulativeChartEntry extends HistogramLineEntry {
  forceHideTooltip?: boolean
}

interface CumulativeChartData {
  data: CumulativeChartEntry[]
  hasNullValues: boolean
  ageHistoColors: string[]
  histoLegendPairs: [string, string, VaccSymptomsAgeRange][]
}

type TempValueEntry = [
  EpidemiologicVaccSymptomsDemographyEntry,
  Record<VaccSymptomsAgeRange, EpidemiologicVaccSymptomsTimelineEntry>,
]

@Component({
  selector: 'bag-detail-card-vacc-symptoms-demography',
  templateUrl: './detail-card-vacc-symptoms-demography.component.html',
  styleUrls: ['./detail-card-vacc-symptoms-demography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVaccSymptomsDemographyComponent
  extends BaseDetailCardVaccinationComponent<EpidemiologicVaccSymptomsDemographyData>
  implements OnInit
{
  @Input()
  hideResetBtn: boolean

  readonly cardDetailPath = RoutePaths.SHARE_DEMOGRAPHY
  readonly heatmapScaleColors = COLORS_VACC_HEATMAP

  readonly ageRangeFilterOptions: MultiSelectValueOption[] = getEnumValues(VaccSymptomsAgeRange).map(
    (age): MultiSelectValueOption => ({
      value: age,
      label:
        age === VaccSymptomsAgeRange.A_UNKNOWN
          ? this.translator.get('Vaccination.VaccSymptoms.Card.Demography.Filter.Unknown')
          : replaceHyphenWithEnDash(age, true),
    }),
  )

  readonly ageRangeFilterCtrl = new FormControl(
    readMultiSelectQueryParamValue(
      [...this.ageRangeFilterOptions],
      VaccSymptomsAgeRange,
      this.route.snapshot.queryParams[QueryParams.VACC_SYMPTOMS_DEMO_AGE_RANGE_FILTER],
    ),
  )
  readonly ageRangeFilter$: Observable<MultiSelectValueOption[]> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACC_SYMPTOMS_DEMO_AGE_RANGE_FILTER, null),
    map((val) => readMultiSelectQueryParamValue([...this.ageRangeFilterOptions], VaccSymptomsAgeRange, val)),
    tap<MultiSelectValueOption[]>(emitValToOwnViewFn(this.ageRangeFilterCtrl)),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([this.ageRangeFilter$]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[ageRangeFilter], geoUnit]) => {
      const ageRanges = <VaccSymptomsAgeRange[]>ageRangeFilter.map((v) => v.value)
      return {
        geoUnit,
        ageRanges,
        timeSpan: this.data.timeSpan,
      }
    }),
    distinctUntilChanged(deepEqual),
    shareReplay(1),
  )
  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))

  readonly demographyData$ = this.currentValues$.pipe(map(this.prepareCumulativeData.bind(this)))

  keys: Record<'info' | 'meta', string>

  override ngOnInit() {
    super.ngOnInit()
    this.ageRangeFilterCtrl.valueChanges
      .pipe(
        map((v: MultiSelectValueOption[]) => createMultiSelectQueryParamValue(v, this.ageRangeFilterOptions)),
        map((v) => ({ [QueryParams.VACC_SYMPTOMS_DEMO_AGE_RANGE_FILTER]: v })),
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))
  }

  demoViewMultiSelectFilterLabelFn: (value: MultiSelectValueOption[]) => string = (value: MultiSelectValueOption[]) => {
    return value.length === this.ageRangeFilterOptions.length
      ? this.translator.get('AgeRangeFilter.AllSelected')
      : this.translator.get('AgeRangeFilter.CountSelected', { count: value.length })
  }

  showCumulTooltip(
    { source, data }: HistogramElFocusEvent<CumulativeChartEntry>,
    histoLegendPairs: [string, string, VaccSymptomsAgeRange][],
  ) {
    if (data.forceHideTooltip) {
      this.hideTooltip()
      return
    }
    const ageRanges = <VaccSymptomsAgeRange[]>getEnumValues(VaccSymptomsAgeRange)
    const noData = !data.values.some(isDefined)
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: data.values
        .map((v, ix) => [histoLegendPairs[ix][0], histoLegendPairs[ix][1], v, histoLegendPairs[ix][2]] as const)
        .sort((a, b) => (ageRanges.indexOf(b[3]) || 0) - (ageRanges.indexOf(a[3]) || 0))
        .sort((a, b) => (b[2] || 0) - (a[2] || 0))
        .map((entry) => {
          return {
            label: replaceHyphenWithEnDash(entry[1], true),
            value: adminFormatNum(entry[2]),
            color: entry[0],
          }
        }),
      noData,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after'],
      offsetX: 16,
    })
  }

  protected init() {
    this.keys = {
      info: 'Vaccination.VaccSymptoms.Card.Demography.InfoText',
      meta: 'Vaccination.VaccSymptoms.Card.Demography.Meta',
    }
  }

  private prepareCumulativeData(cv: CurrentValues): CumulativeChartData | null {
    if (this.data.values.length === 0) {
      return null
    }

    const temEntries: TempValueEntry[] = this.data.values.map((v) => [v, v[GdiSubset.VACC_SYMPTOMS_ALL]])

    const ageRangeKeys = cv.ageRanges.length
      ? cv.ageRanges
      : <VaccSymptomsAgeRange[]>getEnumValues(VaccSymptomsAgeRange)

    const entries: CumulativeChartEntry[] = temEntries.map(([e, rec]) => ({
      date: parseIsoDate(e.date),
      values: ageRangeKeys.map((ageRange) => rec[ageRange][GdiVariant.TOTAL]),
    }))

    const ageRanges = <VaccSymptomsAgeRange[]>getEnumValues(VaccSymptomsAgeRange)
    const histoColors = filterHistoColors(COLORS_SYMPTOMS_AGE_RANGE, cv.ageRanges, VaccSymptomsAgeRange)
    const histoLegendPairs = ageRanges
      .filter((v, ix) => cv.ageRanges.includes(ageRanges[ix]))
      .map((label, ix): [string, string, VaccSymptomsAgeRange] => [
        histoColors[ix],
        label === VaccSymptomsAgeRange.A_UNKNOWN
          ? this.translator.get('Vaccination.VaccSymptoms.Card.Demography.Filter.Unknown')
          : label,
        label,
      ])

    // add empty entry with the weeks start
    const leftPadEntries: CumulativeChartEntry[] = entries
      ? [
          {
            date: parseIsoDate(temEntries[0][0].date),
            values: [],
            forceHideTooltip: true,
          },
        ]
      : []
    return {
      data: [...leftPadEntries, ...entries],
      hasNullValues: entries.some((e) => !e.values.some(isDefined)),
      ageHistoColors: histoColors,
      histoLegendPairs,
    }
  }
}
