import { Component, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { GdiObject, GdiObjectContext } from '@c19/commons'
import { getISOWeek } from 'date-fns'
import { Observable } from 'rxjs'
import { map, takeUntil, tap } from 'rxjs/operators'
import {
  DEFAULT_REGIONS_FILTER,
  getRegionsFilterOptions,
  RegionsFilter,
} from '../shared/models/filters/regions-filter.enum'
import { QueryParams } from '../shared/models/query-params.enum'
import { formatUtcDate } from '../static-utils/date-utils'
import { emitValToOwnViewFn } from '../static-utils/emit-value-to-own-view.function'
import { selectChanged } from '../static-utils/select-changed.operator'
import { updateQueryParamsFn } from '../static-utils/update-query-param.function'
import { BaseWeeklyReportCardComponent } from './base-weekly-report-card.component'

@Component({ template: '' })
export abstract class ExtBaseWeeklyReportCardComponent<T extends GdiObjectContext>
  extends BaseWeeklyReportCardComponent<T>
  implements OnInit
{
  readonly regionsFilterOptions = getRegionsFilterOptions(DEFAULT_REGIONS_FILTER)
  readonly regionsFilterCtrl = new FormControl(this.route.snapshot.queryParams[QueryParams.REGIONS_FILTER] || null)
  readonly regionsFilter$: Observable<RegionsFilter> = this.route.queryParams.pipe(
    selectChanged(QueryParams.REGIONS_FILTER, DEFAULT_REGIONS_FILTER),
    tap<RegionsFilter>(emitValToOwnViewFn(this.regionsFilterCtrl, DEFAULT_REGIONS_FILTER)),
  )

  keys: Record<'topic' | 'info' | 'legendZero' | 'inzTitle' | 'absTitle' | 'inzChartMeta' | 'absChartMeta', string>
  warnKey?: string
  protected abstract readonly cardKeyContext: string

  ngOnInit() {
    this.regionsFilterCtrl.valueChanges
      .pipe(
        takeUntil(this.onDestroy),
        map((v) => ({ [QueryParams.REGIONS_FILTER]: v })),
      )
      .subscribe(updateQueryParamsFn(this.router))
  }

  protected override init() {
    super.init()
    if (this.data && this.data.curr.gdiObject) {
      const topicKey = `WeeklyReport.${this.topic}.DetailTitle`
      const infoKey = `${this.cardKeyContext}.Info`

      switch (this.data.curr.gdiObject) {
        case GdiObject.CASE:
        case GdiObject.DEATH:
        case GdiObject.HOSP:
          this.keys = {
            topic: topicKey,
            info: infoKey,
            legendZero: 'Commons.NoCase',
            inzTitle: 'Commons.Cases.Inz100K',
            inzChartMeta: 'Commons.Cases.Inz100K',
            absTitle: 'Commons.Cases.Absolute',
            absChartMeta: 'Commons.Cases',
          }
          if (this.data.curr.gdiObject === GdiObject.HOSP || this.data.curr.gdiObject === GdiObject.DEATH) {
            this.warnKey = `${this.cardKeyContext}.Warning`
          }
          break
        case GdiObject.TEST:
          this.keys = {
            topic: topicKey,
            info: infoKey,
            legendZero: 'Commons.NoTest',
            inzTitle: 'Commons.Tests.Inz100K',
            inzChartMeta: 'Commons.Tests.Inz100K',
            absTitle: 'Commons.Tests.Absolute',
            absChartMeta: 'Commons.Tests',
          }
          break
      }
    }
  }

  protected createDescription(args: { prevWeekStart: Date; currWeekStart: Date }): string {
    const topic = this.translator.get(this.keys.topic)
    return this.translator.get('WeeklyReport.Card.Description', {
      topic,
      prevDate: formatUtcDate(args.prevWeekStart),
      prevWeek: getISOWeek(args.prevWeekStart),
      currDate: formatUtcDate(args.currWeekStart),
      currWeek: getISOWeek(args.currWeekStart),
    })
  }

  protected createTestSpecificDescription(args: { prevWeekStart: Date; currWeekStart: Date }): string {
    const topicKey = this.data.curr.gdiObject === GdiObject.TEST ? 'DetailTest.Title.Test' : this.keys.topic
    return this.translator.get('WeeklyReport.Card.Description', {
      topic: this.translator.get(topicKey),
      prevDate: formatUtcDate(args.prevWeekStart),
      prevWeek: getISOWeek(args.prevWeekStart),
      currDate: formatUtcDate(args.currWeekStart),
      currWeek: getISOWeek(args.currWeekStart),
    })
  }
}
