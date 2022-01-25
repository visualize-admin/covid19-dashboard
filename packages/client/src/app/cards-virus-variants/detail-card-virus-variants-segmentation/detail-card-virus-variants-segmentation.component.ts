import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CovidVirusVariantsWgsDevelopmentData,
  GdiSubset,
  GdiVariant,
  isDefined,
  TopLevelGeoUnit,
  VirusVariantsWgsDevelopmentEntry,
  VirusVariantsWgsDevelopmentTimeLineEntry,
  WgsVariants,
} from '@c19/commons'
import { Observable, ReplaySubject } from 'rxjs'
import { map, mapTo, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { TranslatorService } from '../../core/i18n/translator.service'
import { UriService } from '../../core/uri.service'
import { HistogramDetailEntry } from '../../diagrams/histogram/histogram-detail/histogram-detail.component'
import { HistogramLineVirusVariantsEntry } from '../../diagrams/histogram/histogram-line/histogram-line-virus-variants.component'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { COLOR_PER_VIRUS_VARIANTS, COLOR_PRIMARY } from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import {
  createMultiSelectQueryParamValue,
  MultiSelectValueOption,
  readMultiSelectQueryParamValue2,
} from '../../static-utils/multi-select-filter-utils'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { BaseDetailVirusVariantsCardComponent, CurrentValuesBase } from '../base-detail-virus-variants-card.component'

interface CurrentValues extends CurrentValuesBase {
  notChFl: boolean
  virusVariants: WgsVariants[]
}

interface ChartDataBase {
  forSingleVariant?: boolean
  entries: HistogramLineEntry[]
  colors: string[]
  sequencingEntries: HistogramDetailEntry[]
  yLabelMaxLength: number
}

interface ChartDataForMultipleVariants extends ChartDataBase {
  forSingleVariant: false
  legendPairs: (readonly [string, string, string])[]
}

interface ChartDataForSingleVariant extends ChartDataBase {
  forSingleVariant: true
  entries: HistogramLineVirusVariantsEntry[]
  legend: [string, string, string]
}

type ChartData = ChartDataForMultipleVariants | ChartDataForSingleVariant

@Component({
  selector: 'bag-detail-card-virus-variants-segmentation',
  templateUrl: './detail-card-virus-variants-segmentation.component.html',
  styleUrls: ['./detail-card-virus-variants-segmentation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardVirusVariantsSegmentationComponent
  extends BaseDetailVirusVariantsCardComponent<CovidVirusVariantsWgsDevelopmentData>
  implements OnInit
{
  readonly cardDetailPath = RoutePaths.SHARE_SEGMENTATION
  readonly sequencingColor = COLOR_PRIMARY
  readonly queryParamsResetGeoUnit = { [QueryParams.GEO_FILTER]: null }

  @Input()
  hideResetBtn: boolean

  variantFilterOptions: MultiSelectValueOption[]
  defaultVariantFilterOptions: MultiSelectValueOption[]

  readonly variantFilterCtrl = new FormControl()
  readonly variantFilter$: Observable<MultiSelectValueOption[]>

  readonly currentValues$: Observable<CurrentValues>
  readonly chartData$: Observable<ChartData | null>
  readonly description$: Observable<string>

  private readonly variantFilterSubject = new ReplaySubject<MultiSelectValueOption[]>(1)

  constructor(
    route: ActivatedRoute,
    router: Router,
    translator: TranslatorService,
    uriService: UriService,
    tooltipService: TooltipService,
  ) {
    super(route, router, translator, uriService, tooltipService)
    this.variantFilter$ = this.variantFilterSubject.asObservable()
    this.currentValues$ = this.variantFilter$.pipe(
      switchMap((args) => this.onChanges$.pipe(mapTo(args))),
      withLatestFrom(this.selectedGeoUnit$),
      map(([variantFilter, geoUnit]) => {
        return {
          timeSpan: this.data.timeSpan,
          geoUnit,
          notChFl: geoUnit !== TopLevelGeoUnit.CHFL,
          virusVariants: variantFilter.map((v) => <WgsVariants>v.value),
        }
      }),
      shareReplay(1),
    )
    this.chartData$ = this.currentValues$.pipe(map(this.prepareChartData.bind(this)))
    this.description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))
  }

  ngOnInit() {
    this.variantFilterOptions = this.getVirusVariantFilterOptions(this.data.variantControls.development)
    this.defaultVariantFilterOptions = this.variantFilterOptions.filter((o) =>
      this.data.variantControls.default.includes(<WgsVariants>o.value),
    )

    this.route.queryParams
      .pipe(
        takeUntil(this.onDestroy),
        selectChanged(QueryParams.VARIANT_FILTER, null),
        map((v) => {
          return readMultiSelectQueryParamValue2(
            this.variantFilterOptions,
            this.data.variantControls.development,
            v,
            this.defaultVariantFilterOptions,
          )
        }),
        tap<MultiSelectValueOption[]>(emitValToOwnViewFn(this.variantFilterCtrl)),
      )
      .subscribe(this.variantFilterSubject)

    this.variantFilterCtrl.setValue(
      readMultiSelectQueryParamValue2(
        this.variantFilterOptions,
        this.data.variantControls.development,
        this.route.snapshot.queryParams[QueryParams.VARIANT_FILTER],
        this.defaultVariantFilterOptions,
      ),
    )

    this.variantFilterCtrl.valueChanges
      .pipe(
        map((v: MultiSelectValueOption[]) => createMultiSelectQueryParamValue(v, this.defaultVariantFilterOptions)),
        map((v) => ({ [QueryParams.VARIANT_FILTER]: v })),
        takeUntil(this.onDestroy),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  showTooltipForMultiple(
    { source, data }: HistogramElFocusEvent<HistogramLineEntry>,
    chartData: ChartDataForMultipleVariants,
  ) {
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: chartData.legendPairs
        .map((p, ix): TooltipListContentEntry & { _val: number } => ({
          color: p[0],
          label: this.translator.get(p[1]),
          value: adminFormatNum(data.values[ix], 1, '%'),
          _val: data.values[ix] ?? -1,
        }))
        .sort((a, b) => b._val - a._val),
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
      offsetY: 16,
    })
  }

  showTooltipForSingle({ source, data }: HistogramElFocusEvent<HistogramLineVirusVariantsEntry>) {
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: [
        {
          label: this.translator.get('Epidemiologic.VirusVariants.Card.Segmentation.Tooltip.UpperBound'),
          value: adminFormatNum(data.band?.upper, 2, '%'),
          lighten: true,
        },
        {
          label: this.translator.get('Epidemiologic.VirusVariants.Card.Segmentation.Tooltip.DailyValue'),
          value: adminFormatNum(data.values[0], 2, '%'),
        },
        {
          label: this.translator.get('Epidemiologic.VirusVariants.Card.Segmentation.Tooltip.LowerBound'),
          value: adminFormatNum(data.band?.lower, 2, '%'),
          lighten: true,
          borderBelow: true,
        },
        {
          label: this.translator.get('Epidemiologic.VirusVariants.Card.Segmentation.Tooltip.Mean7d'),
          value: adminFormatNum(data.values[1], 2, '%'),
        },
      ],
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
      offsetY: 16,
    })
  }

  showSequencingTooltip({ source, data }: HistogramElFocusEvent<HistogramDetailEntry>) {
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: [
        {
          label: this.translator.get('Epidemiologic.VirusVariants.Card.Segmentation.Tooltip.Sequencing.Label'),
          value: adminFormatNum(data.barValues[0]),
          color: this.sequencingColor,
        },
      ],
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, { position: 'above', offsetY: 16 })
  }

  readonly valFmt = (val: number) => `${val}%`

  readonly variantMultiSelectFilterLabelFn: (value: MultiSelectValueOption[]) => string = (
    value: MultiSelectValueOption[],
  ) => {
    return value.length === this.variantFilterOptions.length
      ? this.translator.get('Epidemiologic.VirusVariants.Card.VariantFilter.AllSelected')
      : value.length === 1
      ? this.translator.get(`VirusVariants.${value[0].value}.Label`)
      : this.translator.get('Epidemiologic.VirusVariants.Card.VariantFilter.CountSelected', { count: value.length })
  }

  private prepareChartData(cv: CurrentValues): ChartData | null {
    if (this.data.values.length === 0) {
      return null
    }
    return cv.virusVariants.length === 1
      ? this.prepareChartDataForSingleValue(cv)
      : this.prepareChartDataForMultipleVariants(cv)
  }

  private prepareChartDataForMultipleVariants(cv: CurrentValues): ChartDataForMultipleVariants {
    const dataMapFn = (e: VirusVariantsWgsDevelopmentEntry): HistogramLineEntry => ({
      date: parseIsoDate(e.date),
      values: cv.virusVariants.map((variant) => e[variant].percentageRollmean7d),
    })

    const legendsMapFn = (v: WgsVariants) =>
      cv.virusVariants.includes(v)
        ? ([COLOR_PER_VIRUS_VARIANTS[v], `VirusVariants.${v}.Label`, `VirusVariants.${v}.Description`] as const)
        : undefined

    const [maxSeqVal, sequencingEntries] = this.transformToSequencingEntries()

    const legendPairs = this.data.variantControls.development.map(legendsMapFn).filter(isDefined)
    return {
      forSingleVariant: false,
      entries: this.data.values.map(dataMapFn),
      colors: legendPairs.map((x) => x[0]),
      legendPairs,
      sequencingEntries,
      yLabelMaxLength: Math.max(maxSeqVal.toFixed(0).length, 4),
    }
  }

  private prepareChartDataForSingleValue(cv: CurrentValues): ChartDataForSingleVariant {
    const virusVariant = cv.virusVariants[0]

    const entries = this.data.values.map((e: VirusVariantsWgsDevelopmentEntry): HistogramLineVirusVariantsEntry => {
      const dataItem: VirusVariantsWgsDevelopmentTimeLineEntry = e[virusVariant]
      const upper = dataItem[GdiVariant.PERCENTAGE_CI_HIGH]
      const lower = dataItem[GdiVariant.PERCENTAGE_CI_LOW]
      return {
        date: parseIsoDate(e.date),
        values: [dataItem.percentage, dataItem.percentageRollmean7d],
        band: upper !== null && lower !== null ? { upper, lower } : null,
      }
    })

    const mainColor = COLOR_PER_VIRUS_VARIANTS[virusVariant]

    const [maxSeqVal, sequencingEntries] = this.transformToSequencingEntries()
    return {
      forSingleVariant: true,
      entries,
      colors: ['#ccc', mainColor],
      legend: [mainColor, `VirusVariants.${virusVariant}.Label`, `VirusVariants.${virusVariant}.Description`],
      sequencingEntries,
      yLabelMaxLength: Math.max(maxSeqVal.toFixed(0).length, 4),
    }
  }

  private transformToSequencingEntries(): [number, HistogramDetailEntry[]] {
    const vals = this.data.values.map((v): HistogramDetailEntry => {
      return {
        date: parseIsoDate(v.date),
        barValues: [v[GdiSubset.VARIANT_ALL_WGS].value],
        lineValues: [],
      }
    })
    const max = Math.max(...vals.map((v) => v.barValues[0] || 0))
    return [max, vals]
  }

  private getVirusVariantFilterOptions(variants: WgsVariants[]): MultiSelectValueOption[] {
    return variants.map((variant): MultiSelectValueOption => {
      return {
        value: variant,
        label: this.translator.get(`VirusVariants.${variant}.Label`),
      }
    })
  }
}
