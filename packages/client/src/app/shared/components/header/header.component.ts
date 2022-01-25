import { ChangeDetectionStrategy, Component, Inject, Injector, ViewEncapsulation } from '@angular/core'
import { Language } from '@c19/commons'
import { map } from 'rxjs/operators'
import { CURRENT_LANG } from '../../../core/i18n/language.token'
import { MetaService } from '../../../core/meta/meta.service'
import { throttleFn } from '../../../static-utils/throttle-fn.function'
import { NavBoardService } from './nav-board/nav-board.service'

@Component({
  selector: 'bag-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly urls$ = this.metaService.altUrls$.pipe(map((o) => Object.values(o)))

  // without the throttle, the svg-animation breaks on double-clicks
  readonly toggleNavBoard = throttleFn(this._toggleNavBoard.bind(this), 250)
  readonly iconAnimState$ = this.navBoardService.isOpen$.pipe(
    map((isOpen) => ({
      '#anim-close': isOpen,
      '#anim-menu': !isOpen,
    })),
  )

  constructor(
    @Inject(CURRENT_LANG) readonly currentLanguage: Language,
    private readonly metaService: MetaService,
    private readonly injector: Injector,
    readonly navBoardService: NavBoardService,
  ) {}

  private _toggleNavBoard() {
    this.navBoardService.toggle(this.injector)
  }
}
