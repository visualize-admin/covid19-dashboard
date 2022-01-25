import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  InternationalComparisonDetailData,
  InternationalComparisonDetailDataTimelineValues,
  IntGeoUnit,
  isDefined,
  Iso2Country,
  TimelineValues,
  TimeSpan,
} from '@c19/commons'
import { Observable } from 'rxjs'
import { map, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { GRADIENT_14_D_LEGEND } from '../../shared/commons/colors.const'
import {
  TooltipListContentComponent,
  TooltipListContentData,
} from '../../shared/components/tooltip/tooltip-list-content/tooltip-list-content.component'
import {
  DEFAULT_TIME_SLOT_FILTER_INTERNATIONAL,
  DEFAULT_TIME_SLOT_FILTER_REPRO_DEV,
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
import { BaseInternationalCardComponent } from '../base-international-card.component'

interface CurrentValuesBase {
  hasData: boolean
  geoUnit: IntGeoUnit
}

interface CurrentValuesWithData extends CurrentValuesBase {
  hasData: true
  timeSlot: TimeSlotFilter
  timeFrame: TimeSpan
  values: TimelineValues<InternationalComparisonDetailDataTimelineValues>[]
}

interface CurrentValuesNoData extends CurrentValuesBase {
  hasData: false
}

type CurrentValues = CurrentValuesWithData | CurrentValuesNoData

interface HistoDataBase {
  hasData: boolean
  geoUnit: IntGeoUnit
}

interface HistoDataWithData extends HistoDataBase {
  hasData: true
  withNoData: boolean
  data: HistogramLineEntry[]
  legendPairs: Array<[string, string, number]>
}

interface HistoDataNoData extends HistoDataBase {
  hasData: false
}

type HistoData = HistoDataWithData | HistoDataNoData

@Component({
  selector: 'bag-detail-card-international-case-development',
  templateUrl: './detail-card-international-case-development.component.html',
  styleUrls: ['./detail-card-international-case-development.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailCardInternationalCaseDevelopmentComponent extends BaseInternationalCardComponent implements OnInit {
  @Input()
  data: InternationalComparisonDetailData | null

  readonly timeSlotFilterOptions = getTimeSlotFilterOptions(DEFAULT_TIME_SLOT_FILTER_INTERNATIONAL)
  readonly timeSlotFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.TIME_FILTER] || null)
  readonly timeSlotFilter$: Observable<TimeSlotFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.TIME_FILTER, DEFAULT_TIME_SLOT_FILTER_REPRO_DEV),
    tap<TimeSlotFilter>(emitValToOwnViewFn(this.timeSlotFilterCtrl, DEFAULT_TIME_SLOT_FILTER_REPRO_DEV)),
  )

  readonly currentValues$: Observable<CurrentValues> = this.timeSlotFilter$.pipe(
    switchMap((timeSlot) => {
      return this.onChanges$.pipe(
        withLatestFrom(this.geoUnitFilter$),
        map(([, geoUnitFilter]) => {
          const geoUnit = geoUnitFilter || 'WORLD'

          if (this.data && this.data.values.some((val) => isDefined(val.inzRollsum14d))) {
            const timeFrame = this.data.timeframes[timeSlotFilterTimeFrameKey[timeSlot]]
            const values = getTimeslotCorrespondingValues(this.data.values, timeFrame)
            return {
              hasData: <true>!0,
              geoUnit,
              timeSlot,
              timeFrame,
              values,
            }
          } else {
            return {
              hasData: <false>!1,
              geoUnit,
            }
          }
        }),
      )
    }),
    shareReplay(1),
  )

  readonly description$ = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))
  readonly downloadUrls$ = this.currentValues$.pipe(switchMap(this.createImageDownloadUrls.bind(this)))
  readonly detailUrl$ = this.currentValues$.pipe(map(this.createShareUrl.bind(this)))
  readonly histoData$: Observable<HistoData> = this.currentValues$.pipe(map(this.prepareHistoData.bind(this)))

  protected topic = RoutePaths.DASHBOARD_INTERNATIONAL_CASE
  protected cardType = RoutePaths.SHARE_DEVELOPMENT

  ngOnInit() {
    this.timeSlotFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.TIME_FILTER]: v === DEFAULT_TIME_SLOT_FILTER_INTERNATIONAL ? null : v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  showTooltip({ source, data }: HistogramElFocusEvent<HistogramLineEntry>, geoUnit: IntGeoUnit) {
    const ctx: TooltipListContentData = {
      title: formatUtcDate(data.date),
      entries: [
        {
          label:
            geoUnit === 'WORLD'
              ? this.translator.get('Commons.World')
              : this.translator.get(`CountryRegionFilter.${geoUnit}`),
          value: adminFormatNum(data.values[0]),
          color: GRADIENT_14_D_LEGEND,
          type: 'mean',
        },
        {
          label: this.translator.get('CountryRegionFilter.CH'),
          value: adminFormatNum(data.values[1] ?? null),
          color: GRADIENT_14_D_LEGEND,
          type: 'refMean',
        },
      ],
    }
    this.tooltipService.showCmp(TooltipListContentComponent, source, ctx, {
      position: ['before', 'after'],
      offsetX: 16,
    })
  }

  private prepareHistoData(curr: CurrentValues): HistoData {
    const geoUnit = curr.geoUnit
    if (!curr.hasData) {
      return {
        hasData: false,
        geoUnit,
      }
    }
    const { values } = curr
    return {
      hasData: true,
      geoUnit,
      withNoData: values.some(({ inzRollsum14d }) => !isDefined(inzRollsum14d)),
      data: values.map(({ date, inzRollsum14d, inzRollsum14d_CH }) => ({
        date: parseIsoDate(date),
        values: [inzRollsum14d, inzRollsum14d_CH],
      })),
      legendPairs: [
        [GRADIENT_14_D_LEGEND, geoUnit === 'WORLD' ? this.translator.get('Commons.World') : geoUnit, 4],
        [GRADIENT_14_D_LEGEND, Iso2Country.CH, 2],
      ],
    }
  }

  private prepareDescription(curr: CurrentValues): string | null {
    const title = this.translator.get('International.Cases.Card.DescriptionTitle')
    const regionName = this.translator.get(
      curr.geoUnit === 'WORLD' ? 'Commons.World' : 'CountryRegionFilter.' + curr.geoUnit,
    )
    if (!curr.hasData) {
      return [title, regionName].join(', ')
    }
    const [date1, date2] = [curr.timeFrame.start, curr.timeFrame.end].map((dStr) => formatUtcDate(parseIsoDate(dStr)))
    return [
      title,
      regionName,
      this.translator.get('Commons.DateToDate', { date1, date2 }),
      this.translator.get('Commons.Inz100K'),
    ].join(', ')
  }
}
