import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { EpidemiologicVaccPersonsDevelopmentData, GdiSubset, GeoUnit, isDefined } from '@c19/commons'
import { addDays, differenceInDays } from 'date-fns'
import { combineLatest, Observable } from 'rxjs'
import { map, mapTo, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { HistogramAreaEntry } from '../../diagrams/histogram/histogram-area/histogram-area.component'
import { HistogramDetailEntry } from '../../diagrams/histogram/histogram-detail/histogram-detail.component'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_VACC_MEAN_7D,
  COLOR_VACC_PERSONS_BOOSTER,
  COLOR_VACC_PERSONS_FULL,
  COLOR_VACC_PERSONS_MIN_ONE,
} from '../../shared/commons/colors.const'
import { Source } from '../../shared/components/detail-card/detail-card.component'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import {
  TooltipTableContentComponent,
  TooltipTableContentData,
} from '../../shared/components/tooltip/tooltip-table-content/tooltip-table-content.component'
import {
  DEFAULT_VACC_PERSONS_DEV_CUMULATIVE_FILTER,
  VaccPersonsDevCumulativeFilter,
  vaccPersonsDevCumulativeFilterOptions,
} from '../../shared/models/filters/vacc-persons-dev-cumulative-filter.enum'
import { RelAbsFilter } from '../../shared/models/filters/relativity/rel-abs-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { DOM_ID } from '../../static-utils/dom-id.const'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import {
  BaseDetailCardVaccinationComponent,
  CurrentValuesVaccinationBase,
} from '../base-detail-card-vaccination.component'

interface CurrentValues extends CurrentValuesVaccinationBase {
  isInz: boolean
  cumulativeFilter: VaccPersonsDevCumulativeFilter
}

interface AreaEntry extends HistogramAreaEntry {
  actualValues: (number | null)[]
  total: number | null
}

interface HistogramData {
  isInz: boolean
  data: AreaEntry[]
  legendPairs: Array<[string, string, boolean]>
  colors: string[]
  geoUnit: GeoUnit
}

interface ExtHistogramDetailEntry extends HistogramDetailEntry {
  lineValueMinOne: number | null
  valueMinOne: number | null
  lineValueFull: number | null
  valueFull: number | null
  lineValueBooster: number | null
  valueBooster: number | null
}

interface DailyChartData {
  isInz: boolean
  data: ExtHistogramDetailEntry[]
}

interface MeanChartData {
  isInz: boolean
  data: HistogramLineEntry[]
}

@Component({
  selector: 'bag-detail-card-vacc-persons-development',
  templateUrl: './detail-card-vacc-persons-development.component.html',
  styleUrls: ['./detail-card-vacc-persons-development.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '[attr.id]': `'${DOM_ID.VACC_DEVELOPMENT_CARD}'`,
  },
})
export class DetailCardVaccPersonsDevelopmentComponent
  extends BaseDetailCardVaccinationComponent<EpidemiologicVaccPersonsDevelopmentData>
  implements OnInit
{
  readonly mean7dColor = COLOR_VACC_MEAN_7D

  readonly cardDetailPath = RoutePaths.SHARE_DEVELOPMENT

  readonly cumulativeFilterOptions = vaccPersonsDevCumulativeFilterOptions(DEFAULT_VACC_PERSONS_DEV_CUMULATIVE_FILTER)
  readonly cumulativeFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.VACC_PERSONS_DEV_CUMULATIVE_FILTER] || null,
  )
  readonly cumulativeFilter$: Observable<VaccPersonsDevCumulativeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.VACC_PERSONS_DEV_CUMULATIVE_FILTER, DEFAULT_VACC_PERSONS_DEV_CUMULATIVE_FILTER),
    tap<VaccPersonsDevCumulativeFilter>(
      emitValToOwnViewFn(this.cumulativeFilterCtrl, DEFAULT_VACC_PERSONS_DEV_CUMULATIVE_FILTER),
    ),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.vaccPersonsRelativityFilter$,
    this.cumulativeFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[relativityFilter, cumulativeFilter], geoUnit]) => {
      return {
        geoUnit,
        cumulativeFilter,
        isInz: relativityFilter === RelAbsFilter.RELATIVE,
        timeSpan: this.data.timeSpan,
      }
    }),
    shareReplay(1),
  )
  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))
  readonly hasData$ = this.currentValues$.pipe(map(this.hasData.bind(this)))
  readonly cumulativeData$ = this.currentValues$.pipe(map(this.prepareCumulativeData.bind(this)), shareReplay(1))
  readonly dailyData$ = this.currentValues$.pipe(map(this.prepareDailyData.bind(this)))
  readonly meanData$ = this.currentValues$.pipe(map(this.prepareMeanData.bind(this)))

  keys: Record<'info' | 'metaInz' | 'metaAbs' | 'tooltipLabel1Inz' | 'tooltipLabel1Abs', string>

  readonly colorFirstDose = COLOR_VACC_PERSONS_MIN_ONE
  readonly colorFullyVacced = COLOR_VACC_PERSONS_FULL
  readonly colorBooster = COLOR_VACC_PERSONS_BOOSTER

  readonly yLabelFmt = (val: number) => `${adminFormatNum(val)}%`

  get sources(): Source[] {
    return [
      {
        sourceKey: 'Commons.Source.BAG',
        date: new Date(this.data.vaccSourceDates[GdiSubset.VACC_PERSONS_FULL]),
      },
    ]
  }

  override ngOnInit() {
    super.ngOnInit()
    this.cumulativeFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.VACC_PERSONS_DEV_CUMULATIVE_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  showAreaTooltip({ source, data }: HistogramElFocusEvent<AreaEntry>, isRel: boolean) {
    const toFixed = isRel ? 2 : undefined
    const suffix = isRel ? '%' : undefined
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: [
        {
          label: this.translator.get('Vaccination.Card.Development.Tooltip.VaccPersons.MinOneDose'),
          value: adminFormatNum(data.total, toFixed, suffix),
          color: 'transparent',
          borderBelow: true,
        },
        {
          color: COLOR_VACC_PERSONS_MIN_ONE,
          label: this.translator.get('Vaccination.Card.Development.Tooltip.VaccPersons.Partial'),
          value: adminFormatNum(data.actualValues[0], toFixed, suffix),
        },
        {
          color: COLOR_VACC_PERSONS_FULL,
          label: this.translator.get('Vaccination.Card.Development.Tooltip.VaccPersons.Full'),
          value: adminFormatNum(data.actualValues[1], toFixed, suffix),
        },
        {
          color: COLOR_VACC_PERSONS_FULL,
          label: this.translator.get('Vaccination.Card.VaccPersons.WithBooster'),
          value: adminFormatNum(data.actualValues[2], toFixed, suffix),
          pattern: true,
        },
      ],
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  showDailyChartTooltip({ source, data }: HistogramElFocusEvent<ExtHistogramDetailEntry>, isRel: boolean) {
    const toFixed = isRel ? 2 : undefined
    const suffix = isRel ? '%' : ''
    const hasData = isDefined(data.valueMinOne) && isDefined(data.valueFull)
    const ctx: TooltipTableContentData = {
      title: data.date,
      col1Key: 'DetailCardDevelopment.Legend.Mean',
      col1Bold: true,
      col2Key: 'Vaccination.Card.Development.Tooltip.VaccPersons.Reported',
      col2Bold: true,
      entries: hasData
        ? [
            {
              key: 'Vaccination.Card.VaccPersons.First',
              col1: { color: this.colorFirstDose, value: adminFormatNum(data.lineValueMinOne, 2, suffix) },
              col2: { color: this.colorFirstDose, value: adminFormatNum(data.valueMinOne, toFixed, suffix) },
            },
            {
              key: 'Vaccination.Card.VaccPersons.Full',
              col1: { color: this.colorFullyVacced, value: adminFormatNum(data.lineValueFull, 2, suffix) },
              col2: { color: this.colorFullyVacced, value: adminFormatNum(data.valueFull, toFixed, suffix) },
            },
            {
              key: 'Vaccination.Card.VaccPersons.Booster',
              col1: { color: this.colorBooster, value: adminFormatNum(data.lineValueBooster, 2, suffix) },
              col2: { color: this.colorBooster, value: adminFormatNum(data.valueBooster, toFixed, suffix) },
            },
          ]
        : [],
    }
    this.tooltipService.showCmp(TooltipTableContentComponent, source, ctx, {
      position: ['above'],
      offsetY: 16,
    })
  }

  showMeanTooltip({ source, data }: HistogramElFocusEvent<HistogramLineEntry>, isRel: boolean) {
    const [full, minOne, booster] = data.values

    if ((full === null && minOne === null) || (!isDefined(full) && !isDefined(minOne))) {
      this.hideTooltip()
      return
    }

    // always round to 2 decimal
    const toFixed = 2
    const suffix = isRel ? '%' : ''

    const entries: [string, string, string, number | null][] = [
      [
        this.translator.get('Vaccination.Card.VaccPersons.First'),
        adminFormatNum(minOne, toFixed, suffix),
        this.colorFirstDose,
        minOne,
      ],
      [
        this.translator.get('Vaccination.Card.VaccPersons.Full'),
        adminFormatNum(full, toFixed, suffix),
        this.colorFullyVacced,
        full,
      ],
      [
        this.translator.get('Vaccination.Card.VaccPersons.Booster'),
        adminFormatNum(booster, toFixed, suffix),
        this.colorBooster,
        booster,
      ],
    ]

    const values: TooltipListContentEntry[] = entries
      // filter out empty
      .filter((entry) => isDefined(entry[3]))
      .sort((a, b) => (b[3] || 0) - (a[3] || 0))
      .map((entry) => ({
        label: entry[0],
        value: entry[1],
        color: entry[2],
      }))
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: values,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  protected init() {
    this.keys = {
      info: 'Vaccination.VaccPersons.Card.Development.InfoText',
      metaInz: 'Vaccination.VaccPersons.Card.Development.Meta.Inz',
      metaAbs: 'Vaccination.VaccPersons.Card.Development.Meta.Abs',
      tooltipLabel1Inz: 'Vaccination.Card.Development.Tooltip.FullyVaccinatedPersons.Inz',
      tooltipLabel1Abs: 'Vaccination.Card.Development.Tooltip.FullyVaccinatedPersons.Abs',
    }
  }

  private hasData(): boolean {
    return this.data.values.length !== 0
  }

  private prepareCumulativeData(cv: CurrentValues): HistogramData | null {
    if (cv.cumulativeFilter !== VaccPersonsDevCumulativeFilter.TOTAL) {
      return null
    }
    const timeSpanStart = parseIsoDate(this.data.timeSpan.start)
    const dayDiff = differenceInDays(parseIsoDate(this.data.values[0].date), timeSpanStart)
    const startPadEntries: AreaEntry[] =
      dayDiff < 1
        ? []
        : new Array(dayDiff)
            .fill(0)
            .map((_, ix) => ({ date: addDays(timeSpanStart, ix), values: [], total: null, actualValues: [] }))
    const dataEntries: AreaEntry[] = this.data.values.map((e) => {
      const full = e[GdiSubset.VACC_PERSONS_FULL]
      const partial = e[GdiSubset.VACC_PERSONS_PARTIAL]
      const minOne = e[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE]
      const booster = e[GdiSubset.VACC_PERSONS_FIRST_BOOSTER]

      return {
        date: parseIsoDate(e.date),
        values: cv.isInz
          ? [booster.inzTotal, full.inzTotal, minOne.inzTotal]
          : [booster.total, full.total, minOne.total],
        actualValues: cv.isInz
          ? [partial.inzTotal, full.inzTotal, booster.inzTotal]
          : [partial.total, full.total, booster.total],
        total: cv.isInz ? minOne.inzTotal : minOne.total,
      }
    })
    return {
      isInz: cv.isInz,
      data: [...startPadEntries, ...dataEntries],
      colors: ['url(#patternDots)', COLOR_VACC_PERSONS_FULL, COLOR_VACC_PERSONS_MIN_ONE],
      legendPairs: [
        [COLOR_VACC_PERSONS_MIN_ONE, 'Vaccination.Card.VaccPersons.Partial', false],
        [COLOR_VACC_PERSONS_FULL, 'Vaccination.Card.VaccPersons.Full', false],
        [COLOR_VACC_PERSONS_FULL, 'Vaccination.Card.VaccPersons.WithBooster', true],
      ],
      geoUnit: cv.geoUnit,
    }
  }

  private prepareMeanData(cv: CurrentValues): MeanChartData | null {
    if (cv.cumulativeFilter !== VaccPersonsDevCumulativeFilter.MEAN) {
      return null
    }
    const { isInz } = cv
    const timeSpanStart = parseIsoDate(this.data.timeSpan.start)
    const dayDiff = differenceInDays(parseIsoDate(this.data.values[0].date), timeSpanStart)
    const startPadEntries: HistogramLineEntry[] =
      dayDiff < 1 ? [] : new Array(dayDiff).fill(0).map((_, ix) => ({ date: addDays(timeSpanStart, ix), values: [] }))
    const dataEntries: HistogramLineEntry[] = this.data.values.map((e) => {
      const lineValueFull = cv.isInz
        ? e[GdiSubset.VACC_PERSONS_FULL].inzRollmean7d
        : e[GdiSubset.VACC_PERSONS_FULL].rollmean7d

      const lineValueMinOne = cv.isInz
        ? e[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].inzRollmean7d
        : e[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].rollmean7d

      const lineValueBooster = cv.isInz
        ? e[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].inzRollmean7d
        : e[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].rollmean7d

      return {
        date: parseIsoDate(e.date),
        values: [
          isDefined(lineValueFull) ? lineValueFull : null,
          isDefined(lineValueMinOne) ? lineValueMinOne : null,
          isDefined(lineValueBooster) ? lineValueBooster : null,
        ],
      }
    })
    return {
      isInz,
      data: [...startPadEntries, ...dataEntries],
    }
  }

  private prepareDailyData(cv: CurrentValues): DailyChartData | null {
    if (cv.cumulativeFilter !== VaccPersonsDevCumulativeFilter.DAILY) {
      return null
    }
    const { isInz } = cv
    const timeSpanStart = parseIsoDate(this.data.timeSpan.start)
    const dayDiff = differenceInDays(parseIsoDate(this.data.values[0].date), timeSpanStart)
    const startPadEntries: ExtHistogramDetailEntry[] =
      dayDiff < 1
        ? []
        : new Array(dayDiff).fill(0).map((_, ix) => ({
            date: addDays(timeSpanStart, ix),
            barValues: [0, 0, 0],
            lineValues: [null, null, null],
            lineValueMinOne: null,
            lineValueFull: null,
            lineValueBooster: null,
            valueMinOne: 0,
            valueFull: 0,
            valueBooster: 0,
          }))
    const dataEntries: ExtHistogramDetailEntry[] = this.data.values.map((e) => {
      const barValueFull = cv.isInz ? e[GdiSubset.VACC_PERSONS_FULL].inz : e[GdiSubset.VACC_PERSONS_FULL].value
      const lineValueFull = cv.isInz
        ? e[GdiSubset.VACC_PERSONS_FULL].inzRollmean7d
        : e[GdiSubset.VACC_PERSONS_FULL].rollmean7d

      const barValueMinOne = cv.isInz
        ? e[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].inz
        : e[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].value
      const lineValueMinOne = cv.isInz
        ? e[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].inzRollmean7d
        : e[GdiSubset.VACC_PERSONS_MIN_ONE_DOSE].rollmean7d

      const barValueBooster = cv.isInz
        ? e[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].inz
        : e[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].value
      const lineValueBooster = cv.isInz
        ? e[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].inzRollmean7d
        : e[GdiSubset.VACC_PERSONS_FIRST_BOOSTER].rollmean7d

      return {
        date: parseIsoDate(e.date),
        barValues: [
          isDefined(barValueBooster) ? barValueBooster : 0,
          isDefined(barValueFull) ? barValueFull : 0,
          isDefined(barValueMinOne) ? barValueMinOne : 0,
        ],
        lineValues: [
          isDefined(lineValueBooster) ? lineValueBooster : null,
          isDefined(lineValueFull) ? lineValueFull + (lineValueBooster || 0) : null,
          isDefined(lineValueMinOne) ? lineValueMinOne + (lineValueFull || 0) + (lineValueBooster || 0) : null,
        ],
        lineValueFull: isDefined(lineValueFull) ? lineValueFull : null,
        lineValueMinOne: isDefined(lineValueMinOne) ? lineValueMinOne : null,
        lineValueBooster: isDefined(lineValueBooster) ? lineValueBooster : null,
        valueFull: isDefined(barValueFull) ? barValueFull : 0,
        valueMinOne: isDefined(barValueMinOne) ? barValueMinOne : 0,
        valueBooster: isDefined(barValueBooster) ? barValueBooster : 0,
      }
    })
    return {
      isInz,
      data: [...startPadEntries, ...dataEntries],
    }
  }
}
