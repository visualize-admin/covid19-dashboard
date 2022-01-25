import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  AgeRange,
  GdiVariant,
  TopLevelGeoUnit,
  VaccinationStatus,
  VaccinationStatusDemographyData,
  VaccinationStatusDemographyEntryValues,
} from '@c19/commons'
import { getEnumValues } from '@shiftcode/utilities'
import { addDays } from 'date-fns'
import { combineLatest, merge, Observable } from 'rxjs'
import { map, mapTo, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
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
} from '../../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
} from '../../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { IndicatorFilter } from '../../../shared/models/filters/indicator-filter.enum'
import {
  DEFAULT_VACC_VACCINE_STATUS_RELATIVITY_FILTER,
  getRelativityFilterOptions,
  RelativityFilter,
} from '../../../shared/models/filters/relativity-filter.enum'
import {
  DEFAULT_VACC_DEMO_CUMULATIVE_FILTER,
  getVaccCumulativeFilterOptions,
  VaccCumulativeFilter,
} from '../../../shared/models/filters/vacc-cumulative-filter.enum'
import { OptionDef, OptionsDef } from '../../../shared/models/option-def.type'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { adminFormatNum } from '../../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../../static-utils/emit-value-to-own-view.function'
import { replaceHyphenWithEnDash } from '../../../static-utils/replace-hyphen-with-en-dash.functions'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../../static-utils/update-query-param.function'
import { BaseCardVaccStatusComponent, CurrentValuesVaccStatusBase } from '../base-card-vacc-status.component'

interface CurrentValues extends CurrentValuesVaccStatusBase {
  cumulativeFilter: VaccCumulativeFilter
  relativityFilter: RelativityFilter
  ageRangeFilter: AgeRange
}

interface DemoHistogramLineEntry extends HistogramLineEntry {
  forceHideTooltip?: boolean
  startDate: Date
}

interface ChartData {
  lineData: DemoHistogramLineEntry[]
  dashedLines: Array<string | null>
  legendPairs: Array<[string, string, boolean]>
  colors: string[]
  metaKey: string
  cumulativeFilter: VaccCumulativeFilter
  showNoData: boolean
  skipNoDataBefore: Date | null
  isInz: boolean
}

@Component({
  selector: 'bag-detail-card-vacc-status-demography',
  templateUrl: './detail-card-vacc-status-demography.component.html',
  styleUrls: ['./detail-card-vacc-status-demography.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVaccStatusDemographyComponent
  extends BaseCardVaccStatusComponent<VaccinationStatusDemographyData>
  implements OnInit
{
  static DEFAULT_AGE_RANGE = AgeRange.A_80_PLUS
  protected cardDetailPath = RoutePaths.SHARE_DEMOGRAPHY

  readonly colorCompleteness = COLOR_PRIMARY

  readonly cumulativeFilterOptions = getVaccCumulativeFilterOptions(DEFAULT_VACC_DEMO_CUMULATIVE_FILTER)
  readonly cumulativeFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.DEMO_CUMULATIVE_FILTER])
  readonly cumulativeFilter$: Observable<VaccCumulativeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEMO_CUMULATIVE_FILTER, DEFAULT_VACC_DEMO_CUMULATIVE_FILTER),
    tap<VaccCumulativeFilter>(emitValToOwnViewFn(this.cumulativeFilterCtrl, DEFAULT_VACC_DEMO_CUMULATIVE_FILTER)),
  )

  readonly relativityFilterOptions = getRelativityFilterOptions(DEFAULT_VACC_VACCINE_STATUS_RELATIVITY_FILTER)
  readonly relativityFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.VACC_STATUS_DEMO_REL_FILTER] || null,
  )
  readonly relativityFilter$: Observable<RelativityFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACC_STATUS_DEMO_REL_FILTER, DEFAULT_VACC_VACCINE_STATUS_RELATIVITY_FILTER),
    tap<RelativityFilter>(
      emitValToOwnViewFn(this.vaccDosesRelativityFilterCtrl, DEFAULT_VACC_VACCINE_STATUS_RELATIVITY_FILTER),
    ),
  )

  readonly ageRangeFilterOptions: OptionsDef<AgeRange> = (<AgeRange[]>getEnumValues(AgeRange))
    .reverse()
    .map((val): OptionDef<AgeRange> => {
      return {
        key: replaceHyphenWithEnDash(val),
        val: val === DetailCardVaccStatusDemographyComponent.DEFAULT_AGE_RANGE ? null : val,
      }
    })
  readonly ageRangeFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.VACC_STATUS_DEMO_AGE_RANGE])
  readonly ageRangeFilter$: Observable<AgeRange> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACC_STATUS_DEMO_AGE_RANGE, DetailCardVaccStatusDemographyComponent.DEFAULT_AGE_RANGE),
    tap<AgeRange>(
      emitValToOwnViewFn(this.ageRangeFilterCtrl, DetailCardVaccStatusDemographyComponent.DEFAULT_AGE_RANGE),
    ),
  )

  @Input()
  hideResetBtn: boolean

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.indicatorFilter$,
    this.cumulativeFilter$,
    this.relativityFilter$,
    this.ageRangeFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[indicator, cumulativeFilter, relativityFilter, ageRangeFilter], geoUnit]) => {
      return {
        indicator,
        cumulativeFilter,
        relativityFilter,
        ageRangeFilter,
        geoUnit,
        timeSpan: this.data.timeSpan,
      }
    }),
  )

  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))
  readonly infoKey$ = this.currentValues$.pipe(map(this.prepareInfoKey.bind(this)))

  // data for charts
  readonly chartData$: Observable<ChartData | null> = this.currentValues$.pipe(map(this.prepareChartData.bind(this)))

  override ngOnInit() {
    super.ngOnInit()
    merge(
      this.cumulativeFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.DEMO_CUMULATIVE_FILTER]: v }))),
      this.relativityFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.VACC_STATUS_DEMO_REL_FILTER]: v }))),
      this.ageRangeFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.VACC_STATUS_DEMO_AGE_RANGE]: v }))),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))
  }

  showHistogramLineTooltip(
    { source, data }: HistogramElFocusEvent<DemoHistogramLineEntry>,
    histoLegendPairs: Array<[string, string, boolean]>,
    cumulativeFilter: VaccCumulativeFilter,
    isInz: boolean,
  ) {
    if (data.forceHideTooltip) {
      this.hideTooltip()
      return
    }
    const ctx: TooltipListContentData = {
      entries: data.values
        .map((v, ix) => [histoLegendPairs[ix][0], histoLegendPairs[ix][1], histoLegendPairs[ix][2], v] as const)
        .sort((a, b) => (b[3] || 0) - (a[3] || 0))
        .map((e) => {
          return {
            label: this.translator.get(e[1]),
            value: adminFormatNum(e[3], isInz ? 2 : undefined),
            color: e[0],
            type: 'diagLine',
            dashed: e[2],
          }
        }),
      title:
        cumulativeFilter === VaccCumulativeFilter.TOTAL
          ? formatUtcDate(data.date)
          : this.translator.get('Commons.DateToDate', {
              date1: formatUtcDate(data.startDate),
              date2: formatUtcDate(data.date),
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

    // colors and legend pairs
    const colors: string[] = [
      COLOR_STATUS_LINE_FULL_WITH_BOOSTER,
      COLOR_STATUS_LINE_FULL,
      COLOR_STATUS_LINE_PARTIAL,
      COLOR_STATUS_LINE_NOT_VACCINATED,
    ]

    const legendPairs: Array<[string, string, boolean]> = [
      [COLOR_STATUS_LINE_FULL_WITH_BOOSTER, 'Vaccination.Status.Card.FullyVaccinatedFirstBooster', false],
      [COLOR_STATUS_LINE_FULL, 'Vaccination.Status.Card.FullyVaccinatedNoBooster', false],
      [COLOR_STATUS_LINE_PARTIAL, 'Vaccination.Status.Card.PartiallyVaccinated', false],
      [COLOR_STATUS_LINE_NOT_VACCINATED, 'Vaccination.Status.Card.NotVaccinated', false],
    ]

    const dashedLines = [null, null, null, null]

    // no inz_100 for total for now
    if (cv.relativityFilter === RelativityFilter.INZ_100K && cv.cumulativeFilter === VaccCumulativeFilter.TOTAL) {
      return {
        lineData: [
          {
            startDate: parseIsoDate(this.data.timeSpan.start),
            date: parseIsoDate(this.data.timeSpan.start),
            values: [],
          },
          {
            startDate: parseIsoDate(this.data.timeSpan.end),
            date: parseIsoDate(this.data.timeSpan.end),
            values: [],
          },
        ],
        colors,
        legendPairs,
        dashedLines,
        metaKey: this.prepareChartLabel(cv),
        cumulativeFilter: cv.cumulativeFilter,
        showNoData: true,
        skipNoDataBefore: null,
        isInz: cv.relativityFilter === RelativityFilter.INZ_100K,
      }
    }

    const isInz = cv.relativityFilter === RelativityFilter.INZ_100K
    const lineData: DemoHistogramLineEntry[] = this.data.ageData[cv.indicator].map((v): DemoHistogramLineEntry => {
      const fullyNoBooster = this.extractValue(v[cv.ageRangeFilter][VaccinationStatus.FULLY_VACCINATED_NO_BOOSTER], cv)
      const partially = this.extractValue(v[cv.ageRangeFilter][VaccinationStatus.PARTIALLY_VACCINATED], cv)
      const notVaccinated = this.extractValue(v[cv.ageRangeFilter][VaccinationStatus.NOT_VACCINATED], cv)
      const unknown = this.extractValue(v[cv.ageRangeFilter][VaccinationStatus.UNKNOWN], cv)
      const fullyWithBooster = this.extractValue(
        v[cv.ageRangeFilter][VaccinationStatus.FULLY_VACCINATED_FIRST_BOOSTER],
        cv,
      )
      return {
        startDate: parseIsoDate(v.start),
        date: parseIsoDate(v.end),
        values: isInz
          ? [fullyWithBooster, fullyNoBooster, partially, notVaccinated]
          : [fullyWithBooster, fullyNoBooster, partially, notVaccinated, unknown],
      }
    })

    if (!isInz) {
      colors.push(COLOR_STATUS_LINE_UNKNOWN)
      legendPairs.push([COLOR_STATUS_LINE_UNKNOWN, 'Vaccination.Status.Card.Unknown', false])
      dashedLines.push(null)
    }

    return {
      metaKey: this.prepareChartLabel(cv),
      colors,
      legendPairs,
      dashedLines,
      lineData: cv.cumulativeFilter === VaccCumulativeFilter.WEEKLY ? this.addLeftPadEntries(lineData) : lineData,
      cumulativeFilter: cv.cumulativeFilter,
      showNoData: false,
      skipNoDataBefore: cv.cumulativeFilter === VaccCumulativeFilter.WEEKLY ? addDays(lineData[0].date, 1) : null,
      isInz: cv.relativityFilter === RelativityFilter.INZ_100K,
    }
  }

  private prepareChartLabel(cv: CurrentValues) {
    let indicator
    switch (cv.indicator) {
      case IndicatorFilter.HOSP:
        indicator = 'Hosp'
        break
      case IndicatorFilter.DEATH:
        indicator = 'Death'
        break
    }

    switch (cv.relativityFilter) {
      case RelativityFilter.INZ_100K:
        return `Vaccination.Status.Card.Chart.Meta.${indicator}.Inz`
      case RelativityFilter.ABSOLUTE:
        return `Vaccination.Status.Card.Chart.Meta.${indicator}.Abs`
    }
  }

  private addLeftPadEntries(entries: DemoHistogramLineEntry[]): DemoHistogramLineEntry[] {
    const leftPadEntries: DemoHistogramLineEntry[] = entries
      ? [
          {
            startDate: entries[0].startDate,
            date: entries[0].startDate,
            values: [],
            forceHideTooltip: true,
          },
        ]
      : []
    return [...leftPadEntries, ...entries]
  }

  private extractValue(entry: VaccinationStatusDemographyEntryValues, cv: CurrentValues): number | null {
    let gdiVariant: GdiVariant.WEEK | GdiVariant.INZ_WEEK | GdiVariant.TOTAL | GdiVariant.INZ_TOTAL
    if (cv.relativityFilter === RelativityFilter.INZ_100K) {
      gdiVariant = cv.cumulativeFilter === VaccCumulativeFilter.WEEKLY ? GdiVariant.INZ_WEEK : GdiVariant.INZ_TOTAL
    } else {
      gdiVariant = cv.cumulativeFilter === VaccCumulativeFilter.WEEKLY ? GdiVariant.WEEK : GdiVariant.TOTAL
    }
    return entry[gdiVariant]
  }

  private prepareInfoKey(cv: CurrentValues): string {
    return `Vaccination.Status.Card.Demography.${this.indicatorKey(cv.indicator)}.Info`
  }
}
