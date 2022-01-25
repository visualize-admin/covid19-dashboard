import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import {
  CantonGeoUnit,
  isDefined,
  ReDevelopment,
  ReDevelopmentValues,
  TimelineValues,
  TimeSpan,
  TopLevelGeoUnit,
} from '@c19/commons'
import { Observable } from 'rxjs'
import { map, shareReplay, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators'
import { HistogramLineEntry } from '../../diagrams/histogram/histogram-line/histogram-line.component'
import { HistogramElFocusEvent } from '../../diagrams/histogram/interactive-histogram.component'
import { RoutePaths } from '../../routes/route-paths.enum'
import { GRADIENT_REPRO_LEGEND } from '../../shared/commons/colors.const'
import {
  TooltipBoundsContentComponent,
  TooltipBoundsContentData,
  TooltipWithBoundsLabels,
} from '../../shared/components/tooltip/tooltip-bounds-content/tooltip-bounds-content.component'
import {
  DEFAULT_TIME_SLOT_FILTER_REPRO_DEV,
  getTimeSlotFilterOptions,
  TimeSlotFilter,
  timeSlotFilterTimeFrameKey,
} from '../../shared/models/filters/time-slot-filter.enum'
import { QueryParams } from '../../shared/models/query-params.enum'
import { getTimeslotCorrespondingValues } from '../../static-utils/data-utils'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { DOM_ID } from '../../static-utils/dom-id.const'
import { emitValToOwnViewFn } from '../../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../../static-utils/update-query-param.function'
import { BaseReproCardComponent } from '../base-repro-card.component'

interface CurrentValues {
  geoUnitFilter: CantonGeoUnit | null
  geoUnit: CantonGeoUnit | TopLevelGeoUnit
  timeSlot: TimeSlotFilter
  timeFrame: TimeSpan | null
  values: TimelineValues<ReDevelopmentValues>[] | null
}

interface HistogramData {
  data: HistogramLineEntry[]
  geoUnit: CantonGeoUnit | TopLevelGeoUnit
  legendPairs: Array<[string, string, number]> | null
}

@Component({
  selector: 'bag-detail-card-repro-development',
  templateUrl: './detail-card-repro-development.component.html',
  styleUrls: ['./detail-card-repro-development.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '[attr.id]': `'${DOM_ID.RE_DEVELOPMENT_CARD}'`,
  },
})
export class DetailCardReproDevelopmentComponent
  extends BaseReproCardComponent<ReDevelopment | null>
  implements OnInit
{
  readonly cardType = RoutePaths.SHARE_DEVELOPMENT

  readonly tooltipLabels: TooltipWithBoundsLabels = {
    upperBound: 'Reproduction.Card.Development.Tooltip.UpperBound',
    upperBoundRef: 'Reproduction.Card.Development.Tooltip.UpperBoundRef',
    value: 'Reproduction.Card.Development.Tooltip.ReproNumber',
    valueRef: 'Reproduction.Card.Development.Tooltip.ReproNumberRef',
    lowerBound: 'Reproduction.Card.Development.Tooltip.LowerBound',
    lowerBoundRef: 'Reproduction.Card.Development.Tooltip.LowerBoundRef',
    refValue: 'Reproduction.Card.Development.Tooltip.ReproNumberRef',
    value7d: '', // not used
    value7dRef: '', // not used
  }

  readonly timeSlotFilterOptions = getTimeSlotFilterOptions(DEFAULT_TIME_SLOT_FILTER_REPRO_DEV).filter(
    (v) => v.val !== TimeSlotFilter.LAST_2_WEEKS,
  )
  readonly timeSlotFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.TIME_FILTER] || null)
  readonly timeSlotFilter$: Observable<TimeSlotFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.TIME_FILTER, DEFAULT_TIME_SLOT_FILTER_REPRO_DEV),
    tap<TimeSlotFilter>(emitValToOwnViewFn(this.timeSlotFilterCtrl, DEFAULT_TIME_SLOT_FILTER_REPRO_DEV)),
  )

  readonly currentValues$: Observable<CurrentValues> = this.timeSlotFilter$.pipe(
    switchMap((timeSlot) => {
      return this.onChanges$.pipe(
        withLatestFrom(this.geoUnitFilter$),
        map(([, geoUnitFilter]): CurrentValues => {
          let values: TimelineValues<ReDevelopmentValues>[] | null = null
          let timeFrame: TimeSpan | null = null
          if (this.data) {
            timeFrame = this.data.timeframes[timeSlotFilterTimeFrameKey[timeSlot]]
            values = getTimeslotCorrespondingValues(this.data.values, timeFrame)
          }
          return {
            geoUnitFilter,
            geoUnit: geoUnitFilter || TopLevelGeoUnit.CH,
            timeSlot,
            timeFrame,
            values,
          }
        }),
      )
    }),
    shareReplay(1),
  )

  readonly histogramData$: Observable<HistogramData | null> = this.currentValues$.pipe(
    map(this.prepareHistogramData.bind(this)),
  )

  readonly description$: Observable<string> = this.currentValues$.pipe(map(this.prepareDescription.bind(this)))

  ngOnInit() {
    this.timeSlotFilterCtrl.valueChanges
      .pipe(
        map((v) => ({ [QueryParams.TIME_FILTER]: v })),
        takeUntil(this.onDestroy),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  showTooltip({ source, data }: HistogramElFocusEvent<HistogramLineEntry>, geoUnit: CantonGeoUnit | TopLevelGeoUnit) {
    const ctx: TooltipBoundsContentData = {
      date: data.date,
      geoUnit,
      values:
        isDefined(data.values[0]) && isDefined(data.band)
          ? { value: data.values[0], low: data.band.lower, high: data.band.upper }
          : null,
      refValue: data.values[1] ?? null,
      refGeoUnit: geoUnit !== TopLevelGeoUnit.CH ? TopLevelGeoUnit.CH : null,
      labels: this.tooltipLabels,
    }
    this.tooltipService.showCmp(TooltipBoundsContentComponent, source, ctx, {
      position: ['before', 'after'],
      offsetX: 16,
    })
  }

  private prepareHistogramData({ values, geoUnit }: CurrentValues): HistogramData | null {
    if (!values) {
      return null
    }
    const showRef = geoUnit !== TopLevelGeoUnit.CH
    return {
      geoUnit,
      legendPairs: this.prepareLegend(geoUnit),
      data: values.map(({ date, median_r_mean, median_r_mean_ch, median_r_high, median_r_low }) => ({
        date: parseIsoDate(date),
        values: showRef ? [median_r_mean, median_r_mean_ch] : [median_r_mean],
        band:
          isDefined(median_r_high) && isDefined(median_r_low)
            ? {
                upper: median_r_high,
                lower: median_r_low,
              }
            : null,
      })),
    }
  }

  private prepareDescription({ geoUnit, timeFrame }: CurrentValues): string {
    const parts = [this.translator.get('Reproduction.DetailTitle'), this.translator.get(`GeoFilter.${geoUnit}`)]
    if (timeFrame) {
      const [date1, date2] = [timeFrame.start, timeFrame.end].map((dStr) => formatUtcDate(parseIsoDate(dStr)))
      parts.push(this.translator.get('Commons.DateToDate', { date1, date2 }))
    }
    return parts.join(', ')
  }

  private prepareLegend(geoUnitFilter: CantonGeoUnit | TopLevelGeoUnit): Array<[string, string, number]> | null {
    return geoUnitFilter !== TopLevelGeoUnit.CH
      ? [
          [GRADIENT_REPRO_LEGEND, geoUnitFilter, 4],
          [GRADIENT_REPRO_LEGEND, TopLevelGeoUnit.CH, 2],
        ]
      : null
  }
}
