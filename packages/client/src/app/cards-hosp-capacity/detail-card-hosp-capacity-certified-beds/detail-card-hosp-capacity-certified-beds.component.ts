import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CantonGeoUnit,
  GdiSubset,
  HospCapacityCertAdhocDevelopmentData,
  HospCapacityCertAdhocDevelopmentValue,
  TimeSpan,
  TopLevelGeoUnit,
} from '@c19/commons'
import { Observable } from 'rxjs'
import { map, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { TranslatorService } from '../../core/i18n/translator.service'
import { UriService } from '../../core/uri.service'
import { HistogramDetailEntry } from '../../diagrams/histogram/histogram-detail/histogram-detail.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_HOSP_CAPACITY_ICU_ADHOC_OPERATIONAL,
  COLOR_HOSP_CAPACITY_ICU_CERT_OPERATIONAL,
  COLOR_HOSP_CAPACITY_ICU_CERT_TARGET,
} from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
  TooltipListContentEntry,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import {
  DEFAULT_TIME_SLOT_FILTER_HOSP_CAPACITY_DEV,
  getTimeSlotFilterOptions,
  TimeSlotFilter,
  timeSlotFilterTimeFrameKey,
} from '../../shared/models/filters/time-slot-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { adminFormatNum } from '../../static-utils/admin-format-num.function'
import { getTimeslotCorrespondingValues } from '../../static-utils/data-utils'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { BaseHospCapacityCardComponent } from '../base-hosp-capacity-card.component'

interface CurrentValuesBase {
  geoUnit: CantonGeoUnit | TopLevelGeoUnit
  timeFrame: TimeSpan
}

interface CurrentValues extends CurrentValuesBase {
  values: HospCapacityCertAdhocDevelopmentValue[]
}

interface ExtHistogramDetailEntry extends HistogramDetailEntry {
  item: HospCapacityCertAdhocDevelopmentValue
}

interface DiagramData {
  entries: ExtHistogramDetailEntry[]
}

interface DiagramDisplayInformation {
  color: string
  labelKey: string
  tooltipKey: string
  valueFn: (item: HospCapacityCertAdhocDevelopmentValue) => number | null
}

@Component({
  selector: 'bag-detail-card-hosp-capacity-certified-beds',
  templateUrl: './detail-card-hosp-capacity-certified-beds.component.html',
  styleUrls: ['./detail-card-hosp-capacity-certified-beds.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardHospCapacityCertifiedBedsComponent extends BaseHospCapacityCardComponent<HospCapacityCertAdhocDevelopmentData> {
  readonly legendSquarePairs: Array<DiagramDisplayInformation> = [
    {
      color: COLOR_HOSP_CAPACITY_ICU_CERT_OPERATIONAL,
      labelKey: 'HospCapacity.Card.CertifiedBeds.Operational.Label',
      tooltipKey: 'HospCapacity.Card.CertifiedBeds.Operational.Key',
      valueFn: (item) => item[GdiSubset.HOSP_CAPACITY_ICU_CERT_OPERATIONAL].value,
    },
    {
      color: COLOR_HOSP_CAPACITY_ICU_ADHOC_OPERATIONAL,
      labelKey: 'HospCapacity.Card.CertifiedBeds.AdHoc.Label',
      tooltipKey: 'HospCapacity.Card.CertifiedBeds.AdHoc.Key',
      valueFn: (item) => item[GdiSubset.HOSP_CAPACITY_ICU_ADHOC_OPERATIONAL].value,
    },
  ]

  readonly legendLinePairs: Array<DiagramDisplayInformation> = [
    {
      color: COLOR_HOSP_CAPACITY_ICU_CERT_TARGET,
      labelKey: 'HospCapacity.Card.CertifiedBeds.Target.Label',
      tooltipKey: 'HospCapacity.Card.CertifiedBeds.Target.Key',
      valueFn: (item) => item[GdiSubset.HOSP_CAPACITY_ICU_CERT_TARGET].value,
    },
  ]

  readonly barColors = this.legendSquarePairs.map((legendEntry) => legendEntry.color)
  readonly lineColors = this.legendLinePairs.map((legendEntry) => legendEntry.color)

  protected readonly cardDetailPath = RoutePaths.SHARE_CERTIFIED_BEDS

  readonly timeSlotFilterOptions = getTimeSlotFilterOptions(DEFAULT_TIME_SLOT_FILTER_HOSP_CAPACITY_DEV)
  readonly timeSlotFilerCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.TIME_FILTER] || null)
  readonly timeSlotFilter$: Observable<TimeSlotFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.TIME_FILTER, DEFAULT_TIME_SLOT_FILTER_HOSP_CAPACITY_DEV),
    tap<TimeSlotFilter>(emitValToOwnViewFn(this.timeSlotFilerCtrl, DEFAULT_TIME_SLOT_FILTER_HOSP_CAPACITY_DEV)),
  )

  readonly currentValues$: Observable<CurrentValues> = this.timeSlotFilter$.pipe(
    switchMap((timeSlotFilter) => {
      return this.onChanges$.pipe(
        withLatestFrom(this.geoUnitFilter$),
        map(([, geoUnit]): CurrentValues => {
          const timeFrame = this.data.timeframes[timeSlotFilterTimeFrameKey[timeSlotFilter]]
          return {
            geoUnit,
            timeFrame,
            values: getTimeslotCorrespondingValues(this.data.values, timeFrame),
          }
        }),
      )
    }),
    shareReplay(1),
  )

  readonly diagramData$ = this.currentValues$.pipe(map(this.prepareDiagramData.bind(this)))
  readonly noHospKey$ = this.currentValues$.pipe(map(this.prepareNoHospKey.bind(this)))
  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))
  readonly detailUrl$ = this.currentValues$.pipe(map(this.createShareUrl.bind(this)))
  readonly downloadUrls$ = this.currentValues$.pipe(switchMap(this.createImageDownloadUrls.bind(this)))

  constructor(
    router: Router,
    route: ActivatedRoute,
    uriService: UriService,
    tooltipService: TooltipService,
    translator: TranslatorService,
  ) {
    super(router, route, uriService, tooltipService, translator)
    this.timeSlotFilerCtrl.valueChanges
      .pipe(
        map((v) => ({ [QueryParams.TIME_FILTER]: v })),
        takeUntil(this.onDestroy),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  showTooltip({ source, data: { date, item } }: HistogramElFocusEvent<ExtHistogramDetailEntry>) {
    const mapToEntriesFn = (items: Array<DiagramDisplayInformation>, isSquare: boolean): TooltipListContentEntry[] =>
      items.map((legendEntry) => {
        const value = legendEntry.valueFn(item)
        return {
          color: legendEntry.color,
          label: this.translator.get(legendEntry.tooltipKey),
          value: value !== null ? adminFormatNum(value) : this.translator.get('Commons.NoData.Abbr'),
          type: isSquare ? 'square' : 'line',
          // show border for last entry of square
          borderBelow: isSquare && items.indexOf(legendEntry) === items.length - 1,
        }
      })

    // reverse cause in tooltip the order is just the other way around - slice for copy (reverse changes variable)
    const squareEntries = mapToEntriesFn([...this.legendSquarePairs].reverse(), true)
    const totalEntry: TooltipListContentEntry = {
      label: this.translator.get('HospCapacity.Card.CertifiedBeds.Total.Key'),
      value: adminFormatNum(item[GdiSubset.HOSP_CAPACITY_ICU_TOTAL_OPERATIONAL].value),
    }
    const lineEntries = mapToEntriesFn(this.legendLinePairs, false)
    const entries = [...squareEntries, totalEntry, ...lineEntries]

    const definitiveTooltipValues = [
      ...this.legendSquarePairs.map((pair) => pair.valueFn(item)),
      ...this.legendLinePairs.map((pair) => pair.valueFn(item)),
    ]
    const noData = definitiveTooltipValues.every((value) => value === null)

    const ctx: TooltipListContentData = {
      title: formatUtcDate(date),
      noData,
      entries,
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, { position: 'above', offsetY: 16 })
  }

  protected initCard({ gdiObject }: HospCapacityCertAdhocDevelopmentData) {
    this.infoKey = 'HospCapacity.Icu.Card.CertifiedBeds.InfoText'
    this.noneKey = 'HospCapacity.Icu.NoIntensiveCareUnits'
    this.noneAbbrKey = 'HospCapacity.Icu.NoIntensiveCareUnits.Abbr'
  }

  private prepareDiagramData(curr: CurrentValues): DiagramData | null {
    const mappedEntries = curr.values.map(
      (e: HospCapacityCertAdhocDevelopmentValue): ExtHistogramDetailEntry => ({
        date: parseIsoDate(e.date),
        item: e,
        barValues: this.legendSquarePairs.map((legendPair) => legendPair.valueFn(e)),
        lineValues: this.legendLinePairs.map((legendPair) => legendPair.valueFn(e)),
      }),
    )

    return this.checkNoHosp(curr) ? null : { entries: mappedEntries }
  }

  private prepareNoHospKey(curr: CurrentValues): string | null {
    return this.checkNoHosp(curr) ? this.noneKey : null
  }

  private checkNoHosp(curr: CurrentValues): boolean {
    return curr.values.length === 0
  }

  private createDescription({ geoUnit, timeFrame }: CurrentValues): string {
    const [date1, date2] = [timeFrame.start, timeFrame.end].map((d) => formatUtcDate(parseIsoDate(d)))
    return [
      this.translator.get(this.topicKey),
      this.translator.get(`GeoFilter.${geoUnit}`),
      this.translator.get('Commons.DateToDate', { date1, date2 }),
    ].join(', ')
  }
}
