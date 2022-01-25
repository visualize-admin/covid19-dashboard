import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { GdiObject, GdiVariant, isDefined, OverviewCardV3, TimeSpan } from '@c19/commons'
import { addDays, differenceInDays } from 'date-fns'
import { Observable, ReplaySubject } from 'rxjs'
import { map, mapTo, shareReplay, switchMap } from 'rxjs/operators'
import { DataService } from '../core/data/data.service'
import { CURRENT_LANG } from '../core/i18n/language.token'
import { TextArgs, TranslatorService } from '../core/i18n/translator.service'
import { HistogramLineEntry } from '../diagrams/histogram/histogram-line/histogram-line.component'
import { KeyValueListEntries, KeyValueListEntry } from '../shared/components/key-value-list/key-value-list.component'
import { OverviewCardComponent } from '../shared/components/overview-card/overview-card.component'
import {
  DEFAULT_TIME_SLOT_FILTER_OVERVIEW,
  TimeSlotFilter,
  timeSlotFilterTimeFrameKey,
} from '../shared/models/filters/time-slot-filter.enum'
import { QueryParams } from '../shared/models/query-params.enum'
import { adminFormatNum } from '../static-utils/admin-format-num.function'
import { postfixGdiPercent } from '../static-utils/daily-data-to-key-value-entries.function'
import { getTimeslotCorrespondingValues } from '../static-utils/data-utils'
import { formatUtcDate, parseIsoDate } from '../static-utils/date-utils'
import { selectChanged } from '../static-utils/select-changed.operator'
import { timeframeGdiVariantMapping } from '../static-utils/timeframe-gdi-variant-mapping.const'

export interface CurrentValuesOverview<T = any> {
  timeFilter: TimeSlotFilter
  timeFrame: TimeSpan
  timelineData: T
}

@Component({ template: '' })
export abstract class BaseCardOverviewComponent<C extends OverviewCardV3<any, any, any>>
  implements OnChanges, AfterViewInit, OnDestroy
{
  abstract readonly gdiObject: GdiObject
  abstract readonly cardBaseContext: string

  readonly timeFilter$: Observable<TimeSlotFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.TIME_FILTER, DEFAULT_TIME_SLOT_FILTER_OVERVIEW),
  )

  readonly currentValues$: Observable<CurrentValuesOverview<C['timelineData']>> = this.timeFilter$.pipe(
    switchMap((arg) => this.onChangesSubject.pipe(mapTo(arg))),
    map((timeFilter) => {
      const timeFrame = this.data.timeframes[timeSlotFilterTimeFrameKey[timeFilter]]
      return <CurrentValuesOverview<C['timelineData']>>{
        timeFilter,
        timeFrame,
        timelineData: isDefined(this.data.timelineData)
          ? getTimeslotCorrespondingValues(this.data.timelineData, timeFrame)
          : undefined,
      }
    }),
    shareReplay(1),
  )

  readonly keyValueList$: Observable<KeyValueListEntries> = this.currentValues$.pipe(
    map(this.initKeyValueListData.bind(this)),
  )

  // if exists, returns dataState dependant warn key, otherwise return defaultWarnKey
  readonly warningKey$: Observable<string> = this.dataService.sourceDate$.pipe(
    map((sourceDate) => `${this.cardBaseContext}.Warning.${formatUtcDate(sourceDate, 'yyyyMMdd')}`),
    map((specialWarnKey) =>
      this.translator.tryGet(specialWarnKey) ? specialWarnKey : `${this.cardBaseContext}.Warning`,
    ),
  )

  readonly element: HTMLElement
  readonly afterViewInit$: Observable<void>

  @ViewChild(OverviewCardComponent)
  overviewCard: OverviewCardComponent

  @Input()
  facet?: 'print'

  @Input()
  data: C

  private readonly afterViewInitSubject = new ReplaySubject<void>(1)
  private readonly onChangesSubject = new ReplaySubject<SimpleChanges>(1)

  constructor(
    elRef: ElementRef,
    protected readonly translator: TranslatorService,
    protected readonly dataService: DataService,
    protected route: ActivatedRoute,
    @Inject(CURRENT_LANG) protected readonly lang: string,
    @Inject(LOCALE_ID) protected readonly locale: string,
  ) {
    this.element = elRef.nativeElement
    this.afterViewInit$ = this.afterViewInitSubject.asObservable()
  }

  ngOnChanges(changes: SimpleChanges) {
    this.onChangesSubject.next(changes)
  }

  ngAfterViewInit() {
    this.afterViewInitSubject.next()
    this.afterViewInitSubject.complete()
  }

  ngOnDestroy() {
    this.onChangesSubject.complete()
  }

  resetMinHeight() {
    this.element.style.minHeight = '0'
  }

  updateMinHeight() {
    this.element.style.minHeight = `${this.element.offsetHeight}px`
  }

  protected createDeltaDayEntry(opts?: Partial<KeyValueListEntry>, dailyValues = this.data.dailyValues) {
    let key: string
    const recent = (<any>this.data).deltaDayMode === 'recent'
    if (recent) {
      key =
        this.data.deltaDay === 1
          ? 'OverviewCard.Table.DeltaDayRecent.Label'
          : 'OverviewCard.Table.DeltaDayRecentX.Label'
    } else {
      key = this.data.deltaDay === 1 ? 'OverviewCard.Table.DeltaDay.Label' : 'OverviewCard.Table.DeltaDayX.Label'
    }
    const keyArgs: TextArgs = {
      deltaDay: formatUtcDate(addDays(new Date(this.data.sourceDate), -this.data.deltaDay), 'EEEE', this.locale),
    }
    return {
      key: this.translator.get(key, keyArgs),
      value: adminFormatNum(dailyValues[GdiVariant.DELTA_DAY]),
      info: recent ? this.translator.get(`${this.cardBaseContext}.Table.DeltaDayRecent.Info`) : undefined,
      ...opts,
    }
  }

  protected createSumEntry(
    timeFilter: TimeSlotFilter,
    opts?: Partial<KeyValueListEntry>,
    dailyValues = this.data.dailyValues,
  ) {
    const timeFrame = this.data.timeframes[timeSlotFilterTimeFrameKey[timeFilter]]
    const keyArgs: TextArgs = {
      date: formatUtcDate(parseIsoDate(timeFrame.start)),
    }
    return {
      key: this.translator.get('OverviewCard.Table.Sum.Label', keyArgs),
      value: adminFormatNum(dailyValues[timeframeGdiVariantMapping[timeFilter].sum]),
      ...opts,
    }
  }

  protected createInzEntry(
    timeFilter: TimeSlotFilter,
    opts?: Partial<KeyValueListEntry>,
    dailyValues = this.data.dailyValues,
  ) {
    return {
      key: this.translator.get('OverviewCard.Table.Inz.Label'),
      value: adminFormatNum(dailyValues[timeframeGdiVariantMapping[timeFilter].inz]),
      ...opts,
    }
  }

  protected createKeyValueListEntry(
    variant: GdiVariant,
    key: string,
    keyArgs?: Record<string, string | number>,
    opts: Partial<KeyValueListEntry> = {},
  ): KeyValueListEntry {
    return {
      key: this.translator.get(key, keyArgs),
      value: adminFormatNum(this.data.dailyValues[variant]) + postfixGdiPercent(variant),
      ...opts,
    }
  }

  protected initKeyValueListData({ timeFilter }: CurrentValuesOverview<any>): KeyValueListEntries {
    return [this.createDeltaDayEntry(), this.createSumEntry(timeFilter), this.createInzEntry(timeFilter)]
  }

  protected getPadEntries(
    timeFrame: TimeSpan,
    entries: Array<{ date: string }>,
  ): [HistogramLineEntry[], HistogramLineEntry[]] {
    if (entries.length === 0) {
      return [[], []]
    }
    const startPadEntries = this._getPadEntries(timeFrame.start, entries[0].date)
    const endPadEntries = this._getPadEntries(entries[entries.length - 1].date, timeFrame.end, 1)
    return [startPadEntries, endPadEntries]
  }

  private _getPadEntries(startDateStr: string, endDateStr: string, shift = 0): HistogramLineEntry[] {
    const start = parseIsoDate(startDateStr)
    const end = parseIsoDate(endDateStr)
    const dayDiffStart = differenceInDays(end, start)
    return dayDiffStart < 1
      ? []
      : new Array(dayDiffStart).fill(0).map((_, ix) => ({ date: addDays(start, ix + shift), values: [] }))
  }
}
