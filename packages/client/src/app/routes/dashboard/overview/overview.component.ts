import { Platform } from '@angular/cdk/platform'
import { DOCUMENT } from '@angular/common'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { Language, OverviewDataV4 } from '@c19/commons'
import { WindowRef } from '@shiftcode/ngx-core'
import { asyncScheduler, BehaviorSubject, forkJoin, fromEvent, merge, Subject } from 'rxjs'
import { delay, distinctUntilChanged, filter, map, switchMap, takeUntil, tap, throttleTime } from 'rxjs/operators'
import { BaseCardOverviewComponent } from '../../../cards-overview/base-card-overview.component'
import { CURRENT_LANG } from '../../../core/i18n/language.token'
import { UriService } from '../../../core/uri.service'
import { NavBoardService } from '../../../shared/components/header/nav-board/nav-board.service'
import {
  DEFAULT_TIME_SLOT_FILTER_OVERVIEW,
  getTimeSlotFilterOptions,
  timeSlotFilterKey,
} from '../../../shared/models/filters/time-slot-filter.enum'
import { QueryParams } from '../../../shared/models/query-params.enum'
import { emitValToOwnViewFn } from '../../../static-utils/emit-value-to-own-view.function'
import { navLinks } from '../../../static-utils/nav-links.const'
import { selectChanged } from '../../../static-utils/select-changed.operator'
import { throttleFn } from '../../../static-utils/throttle-fn.function'
import { updateQueryParamsFn } from '../../../static-utils/update-query-param.function'
import { RouteDataKey } from '../../route-data-key.enum'
import { RoutePaths } from '../../route-paths.enum'

@Component({
  selector: 'bag-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly bottomLinks = navLinks
    .filter((v) => v.path !== RoutePaths.DASHBOARD_OVERVIEW)
    .map(({ path, labelKey }) => ({ pathArgs: ['/', this.lang, path], labelKey }))

  get selectedTimeFilterDescriptionKey(): string {
    const selectedOption = getTimeSlotFilterOptions(DEFAULT_TIME_SLOT_FILTER_OVERVIEW).find(
      (o) => o.val === this.timeFilterCtrl.value,
    )
    const key = selectedOption ? selectedOption.key : timeSlotFilterKey[DEFAULT_TIME_SLOT_FILTER_OVERVIEW]
    return `IndicatorsDescription.${key}`
  }

  readonly timeFilterOptions = getTimeSlotFilterOptions(DEFAULT_TIME_SLOT_FILTER_OVERVIEW)
  readonly timeFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.TIME_FILTER] || null)

  readonly stretchCards$ = new BehaviorSubject(true)
  readonly overviewDetailClass$ = new BehaviorSubject<string>('')

  readonly downloadUrls = this.uriService.getDownloadDefinitions()

  readonly overviewData: OverviewDataV4 = this.route.snapshot.data[RouteDataKey.OVERVIEW_DATA]

  @ViewChildren(BaseCardOverviewComponent)
  overviewCards: QueryList<BaseCardOverviewComponent<any>>

  // without the throttle, the svg-animation breaks on double-clicks
  readonly toggleNavBoard = throttleFn(this._toggleNavBoard.bind(this), 250)

  private readonly onDestroy = new Subject<void>()

  constructor(
    @Inject(CURRENT_LANG) readonly lang: Language,
    @Inject(DOCUMENT) private readonly doc: Document,
    private readonly platform: Platform,
    private readonly windowRef: WindowRef,
    private readonly uriService: UriService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly injector: Injector,
    readonly navBoardService: NavBoardService,
  ) {
    if (this.platform.isBrowser && this.windowRef.nativeWindow) {
      const throttledResize$ = fromEvent(this.windowRef.nativeWindow, 'resize').pipe(
        map(() => this.doc.documentElement.clientWidth),
        distinctUntilChanged(),
        throttleTime(300, asyncScheduler, { leading: true, trailing: true }),
      )
      merge(throttledResize$, this.route.queryParams)
        .pipe(
          takeUntil(this.onDestroy),
          tap(this.setCardsStyleStretched),
          // delay necessary,
          //  otherwise it would be sync (stretched=>minHeight) and therefore the browser can't rerender in between
          delay(0),
        )
        .subscribe(this.setCardStyleMinHeight)
    }
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.onDestroy), selectChanged(QueryParams.TIME_FILTER))
      .subscribe(emitValToOwnViewFn(this.timeFilterCtrl))

    this.timeFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.TIME_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  ngAfterViewInit() {
    this.overviewCards.changes
      .pipe(
        filter(() => this.overviewCards.length > 0),
        tap(this.setCardsStyleStretched),
        switchMap(() => forkJoin(this.overviewCards.map((c) => c.afterViewInit$))),
        // delay necessary,
        //   otherwise it would be sync (stretched=>minHeight) and therefore the browser can't rerender in between
        delay(0),
      )
      .subscribe(this.setCardStyleMinHeight)
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  private _toggleNavBoard() {
    this.navBoardService.toggle(this.injector)
  }

  private readonly setCardsStyleStretched = () => {
    if (this.overviewCards?.length) {
      this.stretchCards$.next(true)
      this.overviewCards.map((c) => {
        c.resetMinHeight()
        c.overviewCard.hideInfo()
      })
    }
  }

  private readonly setCardStyleMinHeight = () => {
    if (this.platform.isBrowser) {
      // only on browser, so the ssr html contains the class that the boxes are stretched
      if (this.overviewCards?.length) {
        this.overviewCards.map((c) => c.updateMinHeight())
        this.stretchCards$.next(false)
      }
    }
  }
}
