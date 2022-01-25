import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID } from '@angular/core'
import { Language } from '@c19/commons'
import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { ClientConfigService } from '../../core/client-config.service'
import { DataService } from '../../core/data/data.service'
import { CURRENT_LANG } from '../../core/i18n/language.token'
import { TRANSLATOR_PROVIDER } from '../../core/i18n/translator-provider.const'
import { TranslatorService } from '../../core/i18n/translator.service'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'
import { navLinks } from '../../static-utils/nav-links.const'

function showDueToWeekend(sourceDate: Date): boolean {
  const sourceDateIsFriday = sourceDate.getDay() === 5
  const todaysDay = new Date().getDay()
  const todayIsSatOrSunOrMon = todaysDay === 6 || todaysDay <= 1
  return sourceDateIsFriday && todayIsSatOrSunOrMon
}

const HOLIDAYS = ['2021-05-13', '2021-05-24'].map(parseIsoDate).map((d) => d.getTime())

function showDueToHoliday(sourceDate: Date): boolean {
  const today = new Date().getTime()
  const concerningHoliday = HOLIDAYS.filter((h) => h <= today).reverse()[0]
  return !!concerningHoliday && sourceDate.getTime() < concerningHoliday
}

@Component({
  selector: 'bag-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TRANSLATOR_PROVIDER, TooltipService],
})
export class DashboardComponent {
  readonly introArg$: Observable<{ date: string }>
  readonly links = navLinks
  readonly element: HTMLElement

  readonly noNewDataNotification$: Observable<string | null>
  readonly showSpecialNotification$: Observable<boolean>
  readonly showGlobalDisclaimer$: Observable<boolean>

  constructor(
    @Inject(CURRENT_LANG) readonly lang: Language,
    @Inject(LOCALE_ID) locale: string,
    protected readonly translator: TranslatorService,
    dataService: DataService,
    clientConfig: ClientConfigService,
  ) {
    this.introArg$ = dataService.sourceDate$.pipe(map((v) => ({ date: formatUtcDate(v, 'longDate', locale) })))
    this.noNewDataNotification$ = dataService.sourceDate$.pipe(
      map((v) =>
        showDueToHoliday(v)
          ? 'Commons.NoDataOnHolidaysHint'
          : showDueToWeekend(v)
          ? 'Commons.NoDataOnWeekendHint'
          : null,
      ),
    )
    this.showSpecialNotification$ = dataService.sourceDate$.pipe(
      switchMap((sourceDate) =>
        clientConfig.config$.then((config) => [sourceDate, parseIsoDate(config.showTechnicalIssueHintUntil)] as const),
      ),
      map(([sourceDate, showTechHintTil]) => sourceDate < showTechHintTil),
    )

    this.showGlobalDisclaimer$ = dataService.sourceDate$.pipe(
      map((sourceDate) => {
        const startDate = parseIsoDate('2021-12-20')
        const endDate = parseIsoDate('2022-01-03')
        return !!this.translator.tryGet('Commons.GlobalDisclaimer') && sourceDate >= startDate && sourceDate < endDate
      }),
    )
  }
}
