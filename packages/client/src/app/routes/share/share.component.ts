import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Language } from '@c19/commons'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { DataService } from '../../core/data/data.service'
import { CURRENT_LANG } from '../../core/i18n/language.token'
import { TRANSLATOR_PROVIDER } from '../../core/i18n/translator-provider.const'
import { TranslatorService } from '../../core/i18n/translator.service'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'
import { QueryParams } from '../../shared/models/query-params.enum'
import { formatUtcDate, parseIsoDate } from '../../static-utils/date-utils'

@Component({
  selector: 'bag-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TRANSLATOR_PROVIDER, TooltipService],
})
export class ShareComponent {
  readonly introArg$: Observable<{ date: string }>
  readonly isExport = this.route.snapshot.queryParams[QueryParams.IS_EXPORT] === 'true'
  readonly isSharing = !this.isExport
  readonly showGlobalDisclaimer$: Observable<boolean>

  constructor(
    @Inject(LOCALE_ID) locale: string,
    @Inject(CURRENT_LANG) readonly currentLanguage: Language,
    protected readonly route: ActivatedRoute,
    translator: TranslatorService,
    dataService: DataService,
  ) {
    this.introArg$ = dataService.sourceDate$.pipe(map((v) => ({ date: formatUtcDate(v, 'longDate', locale) })))
    this.showGlobalDisclaimer$ = dataService.sourceDate$.pipe(
      map((sourceDate) => {
        const startDate = parseIsoDate('2021-10-21')
        const endDate = parseIsoDate('2021-10-22')
        return !!translator.tryGet('Commons.GlobalDisclaimer') && sourceDate >= startDate && sourceDate < endDate
      }),
    )
  }
}
