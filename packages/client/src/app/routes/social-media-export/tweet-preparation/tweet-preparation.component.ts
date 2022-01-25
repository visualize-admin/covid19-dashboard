import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { Logger, LoggerService, WindowRef } from '@shiftcode/ngx-core'
import { defer, firstValueFrom, Observable } from 'rxjs'
import { map, shareReplay, startWith } from 'rxjs/operators'
import { interpolateRegexGlobal } from '../../../core/i18n/translator-utils'
import { TextArgs } from '../../../core/i18n/translator.service'
import { RouteDataKey } from '../../route-data-key.enum'

@Component({
  selector: 'bag-tweet-preparation',
  templateUrl: './tweet-preparation.component.html',
  styleUrls: ['./tweet-preparation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TweetPreparationComponent implements OnChanges {
  @Input()
  title: string

  @Input()
  defaultKey: string

  @Input()
  args: TextArgs

  argEntries: Array<[string, string | number]> = []

  readonly templateCtrl = new FormControl(null)
  readonly tweet$: Observable<string> = defer(() =>
    this.templateCtrl.valueChanges.pipe(
      startWith<string>(<string>this.templateCtrl.value),
      map((tpl: string) => interpolateRegexGlobal(tpl, this.args)),
      shareReplay(1),
    ),
  )
  private readonly navigator?: Navigator
  private readonly logger: Logger
  private readonly translations: Record<string, string>

  constructor(route: ActivatedRoute, loggerService: LoggerService, winRef: WindowRef) {
    this.logger = loggerService.getInstance('TweetPreparationComponent')
    this.navigator = winRef.nativeWindow?.navigator
    this.translations = route.snapshot.data[RouteDataKey.TRANSLATIONS]
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.defaultKey) {
      this.templateCtrl.setValue(this.translations[this.defaultKey] || '')
    }
    if (this.args) {
      this.argEntries = Object.entries(this.args)
    }
  }

  replaceLineBreaksForHtml(txt: string) {
    return txt.replace(/(\r\n|\n|\r)/gm, '<br>')
  }

  async copyArg(arg: string, el: HTMLElement) {
    try {
      await this.copyToClipboard(`{${arg}}`)
      await el.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], {
        duration: 1000,
        iterations: 1,
        easing: 'ease-out',
      }).finished
    } catch (err) {
      this.logger.error(err)
    }
  }

  async copyTweet() {
    try {
      const tweet = await firstValueFrom(this.tweet$)
      await this.copyToClipboard(tweet)
    } catch (err) {
      this.logger.error(err)
    }
  }

  private copyToClipboard(text: string) {
    const p = this.navigator?.clipboard?.writeText(text)
    if (!p) {
      throw new Error('Clipboard API not supported')
    }
    return p
  }
}
