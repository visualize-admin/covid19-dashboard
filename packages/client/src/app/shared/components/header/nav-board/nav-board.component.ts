import { animate, state, style, transition, trigger } from '@angular/animations'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Inject,
  ViewEncapsulation,
} from '@angular/core'
import { Router } from '@angular/router'
import { WindowRef } from '@shiftcode/ngx-core'
import { map } from 'rxjs/operators'
import { CURRENT_LANG } from '../../../../core/i18n/language.token'
import { MetaService } from '../../../../core/meta/meta.service'
import { RouteFragment } from '../../../../routes/route-fragment.enum'
import { NavLink, NavLinkParent, navLinks } from '../../../../static-utils/nav-links.const'

export type NavBoardAnimationState = 'void' | 'enter'

interface LinkWrapper extends NavLinkParent {
  open?: boolean
}

@Component({
  selector: 'bag-nav-board',
  templateUrl: './nav-board.component.html',
  styleUrls: ['./nav-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('subList', [
      state('false', style({ height: 0 })),
      state('true', style({ height: '*' })),
      transition('false <=> true', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class NavBoardComponent {
  readonly RouteFragment = RouteFragment
  readonly links: LinkWrapper[]
  readonly urls$ = this.metaService.altUrls$.pipe(map((o) => Object.values(o)))
  readonly ts = Date.now()
  private readonly currentPath: string

  @HostBinding('style.--client-height.px')
  get clientHeight(): number | null {
    // we cannot use 100vh since 100vh is always without dynamically shown nav bars of iOS/Android Browser
    // therefore the language selection could be hidden
    return this.win?.innerHeight ?? null
  }

  private readonly win: Window | null

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly metaService: MetaService,
    router: Router,
    @Inject(CURRENT_LANG) readonly currentLang: string,
    windowRef: WindowRef,
  ) {
    this.win = windowRef.nativeWindow
    this.currentPath = router.routerState.snapshot.url
      .split('/')
      .map((p) => p.replace(/[;?\/]/, ''))
      .join('/')

    this.links = navLinks.map((link) => this.prepareNavLink(link, null))
  }

  close() {
    this.cd.detectChanges()
  }

  toggle(link: LinkWrapper) {
    link.open = !link.open
  }

  private prepareNavLink(link: NavLinkParent, parentPath: null): LinkWrapper
  private prepareNavLink(link: NavLink, parentPath: string): LinkWrapper
  private prepareNavLink(link: NavLinkParent | NavLink, parentPath: string | null): LinkWrapper {
    const path = (parentPath ? [parentPath, link.path] : ['', this.currentLang, link.path]).join('/')
    return parentPath
      ? {
          ...link,
          path,
        }
      : {
          ...link,
          path,
          children: (<NavLinkParent>link).children?.map((l) => this.prepareNavLink(l, path)),
          open: this.currentPath.startsWith(path),
        }
  }
}
