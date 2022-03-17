import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  EpidemiologicVaccDosesDevelopmentData,
  GdiObject,
  GdiSubset,
  GeoUnit,
  isDefined,
  TopLevelGeoUnit,
} from '@c19/commons'
import { addDays, differenceInDays } from 'date-fns'
import { combineLatest, Observable } from 'rxjs'
import { map, mapTo, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { HistogramDetailEntry } from '../../diagrams/histogram/histogram-detail/histogram-detail.component'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_VACC_ADMINISTERED,
  COLOR_VACC_ADMINISTERED_DEV,
  COLOR_VACC_DAILY_BAR,
  COLOR_VACC_DELIVERED_DEV,
  COLOR_VACC_MEAN_7D,
  COLOR_VACC_RECEIVED_DEV,
} from '../../shared/commons/colors.const'
import { Source } from '../../shared/components/detail-card/detail-card.component'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import {
  DEFAULT_VACC_DEV_CUMULATIVE_FILTER,
  VaccDevCumulativeFilter,
  vaccDevCumulativeFilterOptions,
} from '../../shared/models/filters/vacc-dev-cumulative-filter.enum'
import { Inz100AbsFilter } from '../../shared/models/filters/relativity/inz100-abs-filter.enum'
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
  cumulativeFilter: VaccDevCumulativeFilter
}

interface HistogramData {
  isInz: boolean
  data: HistogramLineEntry[]
  legendPairs: Array<[string, string]>
  colors: string[]
  geoUnit: GeoUnit
  dashedLines: Array<string | null>
}

interface DailyChartData {
  isInz: boolean
  data: HistogramDetailEntry[]
  legendPairs: Array<[string, string]>
}

@Component({
  selector: 'bag-detail-card-vacc-doses-development',
  templateUrl: './detail-card-vacc-doses-development.component.html',
  styleUrls: ['./detail-card-vacc-doses-development.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '[attr.id]': `'${DOM_ID.VACC_DEVELOPMENT_CARD}'`,
  },
})
export class DetailCardVaccDosesDevelopmentComponent
  extends BaseDetailCardVaccinationComponent<EpidemiologicVaccDosesDevelopmentData>
  implements OnInit
{
  readonly dailyBarColor = COLOR_VACC_DAILY_BAR
  readonly mean7dColor = COLOR_VACC_MEAN_7D

  readonly cardDetailPath = RoutePaths.SHARE_DEVELOPMENT

  readonly cumulativeFilterOptions = vaccDevCumulativeFilterOptions(DEFAULT_VACC_DEV_CUMULATIVE_FILTER)
  readonly cumulativeFilterCtrl = new FormControl(
    this.route.snapshot.queryParams[QueryParams.DEV_CUMULATIVE_FILTER] || null,
  )
  readonly cumulativeFilter$: Observable<VaccDevCumulativeFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.DEV_CUMULATIVE_FILTER, DEFAULT_VACC_DEV_CUMULATIVE_FILTER),
    tap<VaccDevCumulativeFilter>(emitValToOwnViewFn(this.cumulativeFilterCtrl, DEFAULT_VACC_DEV_CUMULATIVE_FILTER)),
  )

  readonly currentValues$: Observable<CurrentValues> = combineLatest([
    this.vaccDosesRelativityFilter$,
    this.cumulativeFilter$,
  ]).pipe(
    switchMap((args) => this.onChanges$.pipe(mapTo(args))),
    withLatestFrom(this.selectedGeoUnit$),
    map(([[relativityFilter, cumulativeFilter], geoUnit]) => {
      return {
        geoUnit,
        cumulativeFilter,
        isInz: relativityFilter === Inz100AbsFilter.INZ_100,
        timeSpan: this.data.timeSpan,
      }
    }),
    shareReplay(1),
  )
  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))
  readonly sources$ = this.currentValues$.pipe(map(this.prepareSources.bind(this)))
  readonly infoKey$ = this.currentValues$.pipe(map(this.prepareInfoKey.bind(this)))

  readonly hasData$ = this.currentValues$.pipe(map(this.hasData.bind(this)))
  readonly cumulativeData$ = this.currentValues$.pipe(map(this.prepareCumulativeData.bind(this)), shareReplay(1))
  readonly dailyData$ = this.currentValues$.pipe(map(this.prepareDailyData.bind(this)))

  keys: Record<
    | 'info'
    | 'infoCHFL'
    | 'metaInz'
    | 'metaAbs'
    | 'metaDailyInz'
    | 'metaDailyAbs'
    | 'tooltipLabel1Inz'
    | 'tooltipLabel1Abs'
    | 'tooltipLabel2Inz'
    | 'tooltipLabel2Abs'
    | 'tooltipLabel3Inz'
    | 'tooltipLabel3Abs',
    string
  >

  override ngOnInit() {
    super.ngOnInit()
    this.cumulativeFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.DEV_CUMULATIVE_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  showTooltip({ source, data }: HistogramElFocusEvent<HistogramLineEntry>, isRel: boolean, geoUnit: GeoUnit) {
    const getTooltipEntryFn = (entry: [number | null, string, string]): TooltipListContentEntry => ({
      label: this.translator.get(entry[2]),
      value: adminFormatNum(entry[0], isRel ? 2 : undefined),
      color: entry[1],
    })
    const [v0, v1, v2] = data.values
    // legendPair [0] = value, [1] = color, [2] = translate key
    const legendPairEntries: [number | null, string, string][] =
      geoUnit === TopLevelGeoUnit.CHFL
        ? [
            [v0, COLOR_VACC_ADMINISTERED_DEV, isRel ? this.keys.tooltipLabel2Inz : this.keys.tooltipLabel2Abs],
            [v1, COLOR_VACC_DELIVERED_DEV, isRel ? this.keys.tooltipLabel1Inz : this.keys.tooltipLabel1Abs],
            [v2, COLOR_VACC_RECEIVED_DEV, isRel ? this.keys.tooltipLabel3Inz : this.keys.tooltipLabel3Abs],
          ]
        : [
            [v0, COLOR_VACC_ADMINISTERED, isRel ? this.keys.tooltipLabel2Inz : this.keys.tooltipLabel2Abs],
            [v1, COLOR_VACC_DELIVERED_DEV, isRel ? this.keys.tooltipLabel1Inz : this.keys.tooltipLabel1Abs],
          ]

    const entries = legendPairEntries.sort((a, b) => (b[0] || 0) - (a[0] || 0)).map(getTooltipEntryFn)

    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries,
    }

    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after', 'above'],
      offsetX: 16,
    })
  }

  showDailyChartTooltip({ source, data }: HistogramElFocusEvent<HistogramDetailEntry>, isRel: boolean) {
    const v0 = data.barValues[0]
    const v1 = data.lineValues[0]

    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: [
        {
          label: this.translator.get(isRel ? this.keys.tooltipLabel2Inz : this.keys.tooltipLabel2Abs),
          value: adminFormatNum(v0, isRel ? 2 : undefined),
          color: this.dailyBarColor,
        },
        {
          label: this.translator.get('Vaccination.Card.Development.Tooltip.Mean'),
          value: adminFormatNum(v1, isRel ? 2 : undefined),
          color: this.mean7dColor,
          type: 'mean',
        },
      ],
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, { position: ['above'], offsetY: 16 })
  }

  protected init() {
    this.keys = {
      info: 'Vaccination.VaccDoses.Card.Development.InfoText',
      infoCHFL: 'Vaccination.VaccDoses.Card.Development.InfoText.CHFL',
      metaInz: 'Vaccination.VaccDoses.Card.Development.Meta.Inz',
      metaAbs: 'Vaccination.VaccDoses.Card.Development.Meta.Abs',
      metaDailyInz: 'Vaccination.VaccDoses.Card.Development.Meta.Daily.Inz',
      metaDailyAbs: 'Vaccination.VaccDoses.Card.Development.Meta.Daily.Abs',
      tooltipLabel1Inz: 'Vaccination.Card.Development.Tooltip.Delivered.Inz',
      tooltipLabel1Abs: 'Vaccination.Card.Development.Tooltip.Delivered.Abs',
      tooltipLabel2Inz: 'Vaccination.Card.Development.Tooltip.Administered.Inz',
      tooltipLabel2Abs: 'Vaccination.Card.Development.Tooltip.Administered.Abs',
      tooltipLabel3Inz: 'Vaccination.Card.Development.Tooltip.Received.Inz',
      tooltipLabel3Abs: 'Vaccination.Card.Development.Tooltip.Received.Abs',
    }
  }

  private hasData(): boolean {
    return this.data.values.length !== 0
  }

  private prepareInfoKey(cv: CurrentValues): string {
    return this.data.gdiObject === GdiObject.VACC_DOSES
      ? cv.geoUnit === TopLevelGeoUnit.CHFL
        ? this.keys.infoCHFL
        : this.keys.info
      : this.keys.info
  }

  private prepareSources(cv: CurrentValues): Source[] {
    return [
      cv.geoUnit === TopLevelGeoUnit.CHFL
        ? {
            sourceKey: 'Commons.Source.LBA',
            descKey: 'Vaccination.Card.DosesReceivedAndDelivered',
            date: new Date(this.data.vaccSourceDates[GdiSubset.VACC_DOSES_DELIV]),
          }
        : {
            sourceKey: 'Commons.Source.LBA',
            descKey: 'Vaccination.Card.DosesDelivered',
            date: new Date(this.data.vaccSourceDates[GdiSubset.VACC_DOSES_DELIV]),
          },
      {
        sourceKey: 'Commons.Source.BAG',
        descKey: 'Vaccination.Card.DosesAdministered',
        date: new Date(this.data.vaccSourceDates[GdiSubset.VACC_DOSES_ADMIN]),
      },
    ]
  }

  private prepareCumulativeData(cv: CurrentValues): HistogramData | null {
    if (cv.cumulativeFilter !== VaccDevCumulativeFilter.TOTAL) {
      return null
    }
    const timeSpanStart = parseIsoDate(this.data.timeSpan.start)
    const dayDiff = differenceInDays(parseIsoDate(this.data.values[0].date), timeSpanStart)
    const startPadEntries: HistogramLineEntry[] =
      dayDiff < 1 ? [] : new Array(dayDiff).fill(0).map((_, ix) => ({ date: addDays(timeSpanStart, ix), values: [] }))
    const dataEntries: HistogramLineEntry[] = this.data.values.map((e) => ({
      date: parseIsoDate(e.date),
      values:
        cv.geoUnit === TopLevelGeoUnit.CHFL
          ? [
              cv.isInz ? e[GdiSubset.VACC_DOSES_ADMIN].inzTotal : e[GdiSubset.VACC_DOSES_ADMIN].total,
              cv.isInz ? e[GdiSubset.VACC_DOSES_DELIV].inzTotal : e[GdiSubset.VACC_DOSES_DELIV].total,
              cv.isInz ? e[GdiSubset.VACC_DOSES_RECEIVED].inzTotal : e[GdiSubset.VACC_DOSES_RECEIVED].total,
            ]
          : [
              cv.isInz ? e[GdiSubset.VACC_DOSES_ADMIN].inzTotal : e[GdiSubset.VACC_DOSES_ADMIN].total,
              cv.isInz ? e[GdiSubset.VACC_DOSES_DELIV].inzTotal : e[GdiSubset.VACC_DOSES_DELIV].total,
            ],
    }))
    return {
      isInz: cv.isInz,
      data: [...startPadEntries, ...dataEntries],
      colors:
        cv.geoUnit === TopLevelGeoUnit.CHFL
          ? [COLOR_VACC_ADMINISTERED_DEV, COLOR_VACC_DELIVERED_DEV, COLOR_VACC_RECEIVED_DEV]
          : [COLOR_VACC_ADMINISTERED_DEV, COLOR_VACC_DELIVERED_DEV],
      legendPairs:
        cv.geoUnit === TopLevelGeoUnit.CHFL
          ? [
              [COLOR_VACC_RECEIVED_DEV, 'Vaccination.Card.DosesReceived'],
              [COLOR_VACC_DELIVERED_DEV, 'Vaccination.Card.DosesDelivered'],
              [COLOR_VACC_ADMINISTERED_DEV, 'Vaccination.Card.DosesAdministered'],
            ]
          : [
              [COLOR_VACC_DELIVERED_DEV, 'Vaccination.Card.DosesDelivered'],
              [COLOR_VACC_ADMINISTERED_DEV, 'Vaccination.Card.DosesAdministered'],
            ],
      geoUnit: cv.geoUnit,
      dashedLines: cv.geoUnit === TopLevelGeoUnit.CHFL ? [null, null, null, '2 5'] : [null, null, '2 5'],
    }
  }

  private prepareDailyData(cv: CurrentValues): DailyChartData | null {
    if (cv.cumulativeFilter !== VaccDevCumulativeFilter.DAILY) {
      return null
    }
    const { isInz } = cv
    const timeSpanStart = parseIsoDate(this.data.timeSpan.start)
    const dayDiff = differenceInDays(parseIsoDate(this.data.values[0].date), timeSpanStart)
    const startPadEntries: HistogramDetailEntry[] =
      dayDiff < 1
        ? []
        : new Array(dayDiff)
            .fill(0)
            .map((_, ix) => ({ date: addDays(timeSpanStart, ix), barValues: [0], lineValues: [null] }))
    const dataEntries: HistogramDetailEntry[] = this.data.values.map((e) => {
      const barValue = cv.isInz ? e[GdiSubset.VACC_DOSES_ADMIN].inz : e[GdiSubset.VACC_DOSES_ADMIN].value
      const lineValue = cv.isInz
        ? e[GdiSubset.VACC_DOSES_ADMIN].inzRollmean7d
        : e[GdiSubset.VACC_DOSES_ADMIN].rollmean7d
      return {
        date: parseIsoDate(e.date),
        barValues: [isDefined(barValue) ? barValue : 0],
        lineValues: [isDefined(lineValue) ? lineValue : null],
      }
    })

    return {
      isInz,
      data: [...startPadEntries, ...dataEntries],
      legendPairs: [[this.dailyBarColor, 'Vaccination.Card.DosesAdministered']],
    }
  }
}
