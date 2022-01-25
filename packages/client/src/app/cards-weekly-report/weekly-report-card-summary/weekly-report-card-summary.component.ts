import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { GdiObject, WeeklyReportBaseSummaryCard, WeeklySituationReportSummaryCard } from '@c19/commons'
import { getISOWeek } from 'date-fns'
import { Observable } from 'rxjs'
import { map, mapTo, switchMap } from 'rxjs/operators'
import { WeeklyReportDataPair } from '../../core/data/data.service'
import { RoutePaths } from '../../routes/route-paths.enum'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { BaseWeeklyReportCardComponent, CurrenWrValuesBase } from '../base-weekly-report-card.component'

interface TableRow {
  titleKey: string
  content: string
}

interface CurrentValues extends CurrenWrValuesBase {
  tableData: TableRow[] | null
}

@Component({
  selector: 'bag-weekly-report-card-summary',
  templateUrl: './weekly-report-card-summary.component.html',
  styleUrls: ['./weekly-report-card-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportCardSummaryComponent extends BaseWeeklyReportCardComponent<WeeklyReportBaseSummaryCard> {
  infoKey: string

  protected cardKeyContext: string
  protected cardDetailPath: RoutePaths
  protected additionalEntries: TableRow[] | undefined

  readonly currentValues$: Observable<CurrentValues> = this.isoWeekFilter$.pipe(
    switchMap((weekFilter) => this.onChanges$.pipe(mapTo(weekFilter))),
    map((isoWeek) => {
      return {
        isoWeek,
        currWeekStart: parseIsoDate(this.data.curr.timeSpan.start),
        prevWeekStart: parseIsoDate(this.data.prev.timeSpan.start),
        tableData: this.createTableData(),
      }
    }),
  )

  readonly description$ = this.currentValues$.pipe(map(this.createDescription.bind(this)))

  readonly getInfoKey = (i18nTopic: string): string =>
    this.hasNoDataText()
      ? `WeeklyReport.${i18nTopic}.Card.Summary.Info.NoData`
      : `WeeklyReport.${i18nTopic}.Card.Summary.Info`

  createDescription({ currWeekStart }: CurrentValues): string {
    return this.translator.get(`${this.cardKeyContext}.Description`, {
      currWeek: getISOWeek(currWeekStart),
      currDate: formatUtcDate(currWeekStart),
    })
  }

  protected override init() {
    super.init()
    if (this.data.curr.gdiObject === GdiObject.WEEKLY_SIT_REP) {
      this.infoKey = this.getInfoKey('Situation')
      this.cardKeyContext = 'WeeklyReport.Card.Summary'
      this.cardDetailPath = RoutePaths.SHARE_SUMMARY
      // lint is removing cast. So we have to cast it first to any
      const data = <WeeklyReportDataPair<WeeklySituationReportSummaryCard>>(<any>this.data)
      this.additionalEntries = [
        {
          titleKey: `${this.cardKeyContext}.Table.Case`,
          content: this.multiLangOrFallbackText(data.curr[GdiObject.CASE]),
        },
        {
          titleKey: `${this.cardKeyContext}.Table.Hosp`,
          content: this.multiLangOrFallbackText(data.curr[GdiObject.HOSP]),
        },
        {
          titleKey: `${this.cardKeyContext}.Table.Death`,
          content: this.multiLangOrFallbackText(data.curr[GdiObject.DEATH]),
        },
        {
          titleKey: `${this.cardKeyContext}.Table.Test`,
          content: this.multiLangOrFallbackText(data.curr[GdiObject.TEST]),
        },
        {
          titleKey: `${this.cardKeyContext}.Table.CT`,
          content: this.multiLangOrFallbackText(data.curr[GdiObject.CT]),
        },
      ]
    } else if (this.data.curr.gdiObject === GdiObject.HOSP_CAPACITY_ICU) {
      this.infoKey = this.getInfoKey('HospCapacityIcu')
      this.cardKeyContext = 'WeeklyReport.HospCapacityIcu.Card.Summary'
      this.cardDetailPath = RoutePaths.SHARE_HOSP_CAPACITY_ICU_SUMMARY
    }
  }

  private createTableData(): TableRow[] | null {
    if (this.hasNoDataText()) {
      return null
    }

    return [
      {
        titleKey: `${this.cardKeyContext}.Table.ShortSummary`,
        content: this.multiLangOrFallbackText(this.data.curr.summary),
      },
      ...(this.additionalEntries || []),
    ]
  }

  private hasNoDataText(): boolean {
    return this.data && (!this.data.curr.summary || !this.data.curr.summary[this.lang])
  }
}
