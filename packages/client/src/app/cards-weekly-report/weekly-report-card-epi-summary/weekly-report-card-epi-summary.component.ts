import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { GdiObject, WeeklyReportEpidemiologicSummaryCard } from '@c19/commons'
import { getISOWeek } from 'date-fns'
import { Observable } from 'rxjs'
import { map, mapTo, switchMap } from 'rxjs/operators'
import { RoutePaths } from '../../routes/route-paths.enum'
import { TextTableEasyRow } from '../../shared/components/text-table-easy/text-table-easy.component'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { BaseWeeklyReportCardComponent, CurrenWrValuesBase } from '../base-weekly-report-card.component'

interface CurrentValues extends CurrenWrValuesBase {
  tableData: TextTableEasyRow[] | null
}

@Component({
  selector: 'bag-weekly-report-card-epi-summary',
  templateUrl: './weekly-report-card-epi-summary.component.html',
  styleUrls: ['./weekly-report-card-epi-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportCardEpiSummaryComponent extends BaseWeeklyReportCardComponent<WeeklyReportEpidemiologicSummaryCard> {
  readonly cardDetailPath = RoutePaths.SHARE_EPI_SUMMARY

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

  keys: Record<'info' | 'detailTitle', string>

  createDescription({ currWeekStart }: CurrentValues): string {
    return this.translator.get(`WeeklyReport.Card.EpiSummary.Description`, {
      topic: this.translator.get(this.keys.detailTitle),
      currWeek: getISOWeek(currWeekStart),
      currDate: formatUtcDate(currWeekStart),
    })
  }

  protected override init() {
    super.init()
    this.keys = {
      info: this.hasNoDataText()
        ? `WeeklyReport.${this.topic}.Card.EpiSummary.Info.NoData`
        : `WeeklyReport.${this.topic}.Card.EpiSummary.Info`,
      detailTitle: `WeeklyReport.${this.topic}.DetailTitle`,
    }
  }

  private createTableData(): TextTableEasyRow[] | null {
    if (this.hasNoDataText()) {
      return null
    }
    const rows: TextTableEasyRow[] = [
      {
        titleKey: `WeeklyReport.Card.EpiSummary.Table.ShortSummary`,
        content: this.multiLangOrFallbackText(this.data.curr.summary),
      },
      {
        titleKey: `WeeklyReport.Card.EpiSummary.Table.Geography`,
        content: this.multiLangOrFallbackText(this.data.curr.geography),
      },
    ]

    if (this.data.curr.gdiObject === GdiObject.TEST) {
      rows.push({
        titleKey: `WeeklyReport.Card.EpiSummary.Table.PositivityRate`,
        content: this.multiLangOrFallbackText(this.data.curr.testPositivity),
      })
    }

    rows.push({
      titleKey: `WeeklyReport.Card.EpiSummary.Table.Demography`,
      content: this.multiLangOrFallbackText(this.data.curr.demography),
    })

    return rows
  }

  private hasNoDataText(): boolean {
    return this.data && (!this.data.curr.summary || !this.data.curr.summary[this.lang])
  }
}
