import { ChangeDetectionStrategy, Component, Inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Language, MultiLanguageText, WeeklyReportMethodsCard } from '@c19/commons'
import { WeeklyReportDataPair } from '../../../../core/data/data.service'
import { CURRENT_LANG } from '../../../../core/i18n/language.token'
import { formatUtcDate } from '../../../../static-utils/date-utils'
import { RouteDataKey } from '../../../route-data-key.enum'

@Component({
  selector: 'bag-weekly-report-methods-and-sources',
  templateUrl: './weekly-report-methods-and-sources.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportMethodsAndSourcesComponent {
  // since isoWeek doesn't determine the text take it from the route data
  readonly methodData: WeeklyReportDataPair<WeeklyReportMethodsCard> =
    // tslint:disable-next-line:no-non-null-assertion
    <WeeklyReportDataPair<WeeklyReportMethodsCard>>this.route!.snapshot.data[RouteDataKey.DETAIL_DATA].text

  constructor(private readonly route: ActivatedRoute, @Inject(CURRENT_LANG) private readonly lang: Language) {}

  multiLangOrFallbackText(text: MultiLanguageText | undefined): string {
    return (text && text[this.lang]) || ''
  }

  getDataStatusArgs(sourceDate: string) {
    const srcDate = new Date(sourceDate)
    return {
      date: formatUtcDate(srcDate),
      timeHH: formatUtcDate(srcDate, 'HH'),
      timeMM: formatUtcDate(srcDate, 'mm'),
    }
  }
}
