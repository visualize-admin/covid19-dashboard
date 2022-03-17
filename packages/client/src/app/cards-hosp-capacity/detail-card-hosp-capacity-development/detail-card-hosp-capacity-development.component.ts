import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  CantonGeoUnit,
  GdiObject,
  HospCapacityDevelopmentAbsRecord,
  HospCapacityDevelopmentData,
  HospCapacityDevelopmentRelRecord,
  HospCapacityExistsRecord,
  isDefined,
  TimeSpan,
  TopLevelGeoUnit,
} from '@c19/commons'
import { combineLatest, merge, Observable } from 'rxjs'
import { map, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { HistogramDetailEntry } from '../../diagrams/histogram/histogram-detail/histogram-detail.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import {
  COLOR_HOSP_CAP_COVID,
  COLOR_HOSP_CAP_FREE,
  COLOR_HOSP_CAP_NON_COVID,
  COLOR_NO_CASE,
  COLORS_HOSP_CAP_BARS,
  COLORS_HOSP_CAP_LINES,
} from '../../shared/commons/colors.const'
import {
  TooltipTableContentComponent,
  TooltipTableContentData,
  TooltipTableContentEntry,
} from '../../shared/components/tooltip/tooltip-table-content/tooltip-table-content.component'
import {
  AbsRelFilter,
  DEFAULT_REL_ABS_FILTER_HOSP_CAPACITY_DEV,
  getAbsRelFilterOptions,
} from '../../shared/models/filters/relativity/abs-rel-filter.enum'
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
import { DOM_ID } from '../../static-utils/dom-id.const'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { BaseHospCapacityCardComponent } from '../base-hosp-capacity-card.component'

interface CurrentValuesBase {
  geoUnit: CantonGeoUnit | TopLevelGeoUnit
  timeFrame: TimeSpan
}

interface CurrentValuesRel extends CurrentValuesBase {
  isRelative: true
  values: HospCapacityDevelopmentRelRecord[]
}

interface CurrentValuesAbs extends CurrentValuesBase {
  isRelative: false
  values: HospCapacityDevelopmentAbsRecord[]
}

type CurrentValues = CurrentValuesRel | CurrentValuesAbs

interface ExtHistogramDetailEntry extends HistogramDetailEntry {
  item: HospCapacityDevelopmentRelRecord | HospCapacityDevelopmentAbsRecord
}

interface DiagramData {
  entries: ExtHistogramDetailEntry[]
  isRelative: boolean
  hasNoData: boolean
  hasNotExistingItem: boolean
}

@Component({
  selector: 'bag-detail-card-hosp-capacity-development',
  templateUrl: './detail-card-hosp-capacity-development.component.html',
  styleUrls: ['./detail-card-hosp-capacity-development.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '[attr.id]': `'${DOM_ID.HOSP_DEVELOPMENT_CARD}'`,
  },
})
export class DetailCardHospCapacityDevelopmentComponent
  extends BaseHospCapacityCardComponent<HospCapacityDevelopmentData>
  implements OnInit
{
  readonly barColors = COLORS_HOSP_CAP_BARS
  readonly lineColors = COLORS_HOSP_CAP_LINES
  readonly cardDetailPath = RoutePaths.SHARE_DEVELOPMENT
  readonly noCaseColor = COLOR_NO_CASE

  readonly timeSlotFilterOptions = getTimeSlotFilterOptions(DEFAULT_TIME_SLOT_FILTER_HOSP_CAPACITY_DEV)
  readonly timeSlotFilerCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.TIME_FILTER] || null)
  readonly timeSlotFilter$: Observable<TimeSlotFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.TIME_FILTER, DEFAULT_TIME_SLOT_FILTER_HOSP_CAPACITY_DEV),
    tap<TimeSlotFilter>(emitValToOwnViewFn(this.timeSlotFilerCtrl, DEFAULT_TIME_SLOT_FILTER_HOSP_CAPACITY_DEV)),
  )

  readonly relAbsFilterOptions = getAbsRelFilterOptions(DEFAULT_REL_ABS_FILTER_HOSP_CAPACITY_DEV)
  readonly relAbsFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.REL_ABS_FILTER] || null)
  readonly relAbsFilter$: Observable<AbsRelFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.REL_ABS_FILTER, DEFAULT_REL_ABS_FILTER_HOSP_CAPACITY_DEV),
    tap<AbsRelFilter>(emitValToOwnViewFn(this.relAbsFilterCtrl, DEFAULT_REL_ABS_FILTER_HOSP_CAPACITY_DEV)),
  )

  readonly legendSquarePairs: Array<[string, string]> = [
    [COLOR_HOSP_CAP_COVID, 'HospCapacity.Card.BedsCovid.Label'],
    [COLOR_HOSP_CAP_NON_COVID, 'HospCapacity.Card.BedsNonCovid.Label'],
    [COLOR_HOSP_CAP_FREE, 'HospCapacity.Card.BedsFree.Label'],
  ]

  readonly currentValues$ = combineLatest([this.relAbsFilter$, this.timeSlotFilter$]).pipe(
    switchMap(([relativeFilter, timeSlotFilter]) => {
      return this.onChanges$.pipe(
        withLatestFrom(this.geoUnitFilter$),
        map(([, geoUnit]) => {
          const timeFrame = this.data.timeframes[timeSlotFilterTimeFrameKey[timeSlotFilter]]
          return relativeFilter === AbsRelFilter.RELATIVE
            ? {
                geoUnit,
                timeFrame,
                isRelative: <true>!0,
                values: getTimeslotCorrespondingValues(this.data.valuesRel, timeFrame),
              }
            : {
                geoUnit,
                timeFrame,
                isRelative: <false>!1,
                values: getTimeslotCorrespondingValues(this.data.valuesAbs, timeFrame),
              }
        }),
      )
    }),
    shareReplay(1),
  )

  readonly diagramData$ = this.currentValues$.pipe(map(this.prepareDiagramData.bind(this)), shareReplay(1))
  readonly noHospKey$ = this.currentValues$.pipe(map(this.checkNoHosp.bind(this)))
  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))
  readonly detailUrl$ = this.currentValues$.pipe(map(this.createShareUrl.bind(this)))
  readonly downloadUrls$ = this.currentValues$.pipe(switchMap(this.createImageDownloadUrls.bind(this)))

  ngOnInit() {
    merge(
      this.timeSlotFilerCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.TIME_FILTER]: v }))),
      this.relAbsFilterCtrl.valueChanges.pipe(map((v) => ({ [QueryParams.REL_ABS_FILTER]: v }))),
    )
      .pipe(takeUntil(this.onDestroy))
      .subscribe(updateQueryParamsFn(this.router))
  }

  showTooltip({ source, data: { date, item } }: HistogramElFocusEvent<ExtHistogramDetailEntry>, isRelative: boolean) {
    const ctx: TooltipTableContentData = isRelative
      ? this.getTooltipDataForRel(date, <HospCapacityDevelopmentRelRecord>item)
      : this.getTooltipDataForAbs(date, <HospCapacityDevelopmentAbsRecord>item)
    this.tooltipService.showCmp(TooltipTableContentComponent, source, ctx, { position: 'above', offsetY: 16 })
  }

  readonly percentageFmt = (val: number) => `${val}%`

  protected initCard({ gdiObject }: HospCapacityDevelopmentData) {
    switch (gdiObject) {
      case GdiObject.HOSP_CAPACITY_ICU:
        this.infoKey = 'HospCapacity.Icu.Card.Development.InfoText'
        this.noneKey = `HospCapacity.Icu.NoIntensiveCareUnits`
        this.noneAbbrKey = `HospCapacity.Icu.NoIntensiveCareUnits.Abbr`
        break
      case GdiObject.HOSP_CAPACITY_TOTAL:
        this.infoKey = 'HospCapacity.Total.Card.Development.InfoText'
        this.noneKey = `HospCapacity.Total.NoHospital`
        this.noneAbbrKey = `HospCapacity.Total.NoHospital`
        break
    }
  }

  private prepareDiagramData(curr: CurrentValues): DiagramData | null {
    const mappedEntries = curr.isRelative
      ? curr.values.map(
          (e: HospCapacityDevelopmentRelRecord): ExtHistogramDetailEntry => ({
            date: parseIsoDate(e.date),
            item: e,
            exists: e.exists,
            // when changing order, also change in showTooltip
            barValues: [e.percentage_hospBedsCovid, e.percentage_hospBedsNonCovid, e.percentage_hospBedsFree],
            lineValues: [],
          }),
        )
      : curr.values.map(
          (e: HospCapacityDevelopmentAbsRecord): ExtHistogramDetailEntry => ({
            date: parseIsoDate(e.date),
            item: e,
            exists: e.exists,
            // when changing order, also change in showTooltip
            barValues: [e.value_hospBedsCovid, e.value_hospBedsNonCovid, e.value_hospBedsFree],
            lineValues: [e.rollmean15d_hospBedsCovid, e.rollmean15d_hospBedsAll, e.rollmean15d_hospBedsCapacity],
          }),
        )

    // if one value is null, set all values to null
    const entries = mappedEntries.map((entry) =>
      entry.barValues.some((v) => v === null) ? { ...entry, values: [null, null, null] } : entry,
    )

    return entries.some((e) => e.exists)
      ? {
          isRelative: curr.isRelative,
          entries,
          hasNoData: entries.some((e) => !e.barValues.every(isDefined)),
          hasNotExistingItem: entries.some((e) => !e.exists),
        }
      : null
  }

  private checkNoHosp(curr: CurrentValues): string | null {
    const values: HospCapacityExistsRecord[] = <any>curr.values
    return values.length === 0 || values.every((x) => !x.exists) ? this.noneKey : null
  }

  private createDescription({ geoUnit, timeFrame }: CurrentValues): string {
    const [date1, date2] = [timeFrame.start, timeFrame.end].map((d) => formatUtcDate(parseIsoDate(d)))
    return [
      this.translator.get(this.topicKey),
      this.translator.get(`GeoFilter.${geoUnit}`),
      this.translator.get('Commons.DateToDate', { date1, date2 }),
    ].join(', ')
  }

  private getTooltipDataForRel(date: Date, item: HospCapacityDevelopmentRelRecord): TooltipTableContentData {
    const noItem = !item.exists
    const noData = item.exists && item.percentage_hospBedsAll === null && item.value_hospBedsCapacity === null

    return {
      title: date,
      col2Key: 'HospCapacity.Card.Development.RelativeTooltip.Estimated',
      col2Bold: true,
      entries:
        noItem || noData
          ? null
          : [
              {
                key: 'HospCapacity.Card.BedsCovid.Key',
                color: COLOR_HOSP_CAP_COVID,
                col1: { value: adminFormatNum(item.value_hospBedsCovid) },
                col2: { value: adminFormatNum(item.percentage_hospBedsCovid, 1, '%') },
              },
              {
                key: 'HospCapacity.Card.BedsNonCovid.Key',
                color: COLOR_HOSP_CAP_NON_COVID,
                col1: { value: adminFormatNum(item.value_hospBedsNonCovid) },
                col2: { value: adminFormatNum(item.percentage_hospBedsNonCovid, 1, '%') },
              },
              {
                key: 'HospCapacity.Card.BedsFree.Key',
                color: COLOR_HOSP_CAP_FREE,
                col1: { value: adminFormatNum(item.value_hospBedsFree) },
                col2: { value: adminFormatNum(item.percentage_hospBedsFree, 1, '%') },
              },
            ],
      noDataKey: noItem ? this.noneKey : null,
    }
  }

  private getTooltipDataForAbs(date: Date, item: HospCapacityDevelopmentAbsRecord): TooltipTableContentData {
    // no hospBedsCapacity means noData
    const noItem = !item.exists
    const noData = item.exists && item.rollmean15d_hospBedsCapacity === null && item.value_hospBedsCapacity === null

    const entries: TooltipTableContentEntry[] | null =
      noItem || noData
        ? null
        : [
            {
              key: 'HospCapacity.Card.BedsCovid.Key',
              col1: { value: adminFormatNum(item.rollmean15d_hospBedsCovid), color: COLOR_HOSP_CAP_COVID },
              col2: {
                value: isDefined(item.value_hospBedsCovid) ? adminFormatNum(item.value_hospBedsCovid) : null,
                color: COLOR_HOSP_CAP_COVID,
              },
            },
            {
              key: 'HospCapacity.Card.BedsNonCovid.Key',
              col1: { value: adminFormatNum(item.rollmean15d_hospBedsNonCovid), color: COLOR_HOSP_CAP_NON_COVID },
              col2: {
                value: isDefined(item.value_hospBedsNonCovid) ? adminFormatNum(item.value_hospBedsNonCovid) : null,
                color: COLOR_HOSP_CAP_NON_COVID,
              },
            },
            {
              key: 'HospCapacity.Card.BedsFree.Key',
              col1: { value: adminFormatNum(item.rollmean15d_hospBedsFree), color: COLOR_HOSP_CAP_FREE },
              col2: {
                value: isDefined(item.value_hospBedsFree) ? adminFormatNum(item.value_hospBedsFree) : null,
                color: COLOR_HOSP_CAP_FREE,
              },
            },
          ]
    const footer: TooltipTableContentEntry[] | null =
      noItem || noData
        ? null
        : [
            {
              key: 'HospCapacity.Card.BedsTotal.Key',
              col1: { value: adminFormatNum(item.rollmean15d_hospBedsCapacity) },
              col2: {
                value: isDefined(item.value_hospBedsCapacity) ? adminFormatNum(item.value_hospBedsCapacity) : null,
              },
            },
          ]
    return {
      title: date,
      col1Key: 'HospCapacity.Card.Mean15Days.Label',
      col1Bold: true,
      col1Hidden: !(
        (noItem || isDefined(item.rollmean15d_hospBedsCovid)) &&
        (noItem || isDefined(item.rollmean15d_hospBedsNonCovid)) &&
        (noItem || isDefined(item.rollmean15d_hospBedsCapacity))
      ),
      col2Key: 'HospCapacity.Card.Reported.Label',
      col2Bold: true,
      entries,
      footer,
      noDataKey: noItem ? this.noneKey : null,
    }
  }
}
