import { BreakpointObserver } from '@angular/cdk/layout'
import { Location } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core'
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router'
import { filterIfInstanceOf, WindowRef } from '@shiftcode/ngx-core'
import { BehaviorSubject, fromEvent, Observable } from 'rxjs'
import {
  filter,
  first,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators'
import { RouteFragment } from '../../../routes/route-fragment.enum'
import { Breakpoints } from '../../../static-utils/breakpoints.enum'
import { scrollIntoView } from '../../../static-utils/scroll-into-view.function'
import { MASTER_DETAIL_DATA } from './master-detail-data.token'
import { MasterDetailData } from './master-detail-data.type'
import { MasterDetailContext } from './master-detail-menu-item-context.type'
import { MasterDetailMenuItem } from './master-detail-menu-item.type'

@Component({
  selector: 'bag-master-detail',
  templateUrl: './master-detail.component.html',
  styleUrls: ['./master-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasterDetailComponent {
  @ViewChild('menuScrollContainerElRef')
  menuScrollContainerElRef: ElementRef<HTMLDivElement>

  @ViewChild('menuWrapperElRef')
  menuWrapperElRef: ElementRef<HTMLDivElement>

  @ViewChild('detailContainerRef')
  detailContainerRef: ElementRef

  @ViewChildren('menuItemEl', { read: ElementRef })
  set menuItemElRefs(ql: QueryList<ElementRef>) {
    // angular sets the QueryList twice (but the same instance).
    if (ql !== this._menuItemElRefs) {
      this._menuItemElRefs = ql
      this.afterMenuItemsSet()
      // it's not a replaySubject so we force to have at least one value emitted
      this._menuItemElRefs.notifyOnChanges()
    }
  }

  get menuItemElRefs() {
    return this._menuItemElRefs
  }

  get useSlimFacet(): boolean {
    return this.data.facet === 'slim'
  }

  readonly items$: Observable<MasterDetailMenuItem[]>

  get templateRef(): TemplateRef<MasterDetailContext> {
    return this.data.templateRef
  }

  readonly currentMenuItem$ = new BehaviorSubject<MasterDetailMenuItem | null>(null)
  readonly activeMenuItemIndex$: Observable<number>
  readonly showDetail$: Observable<boolean> = this.currentMenuItem$.pipe(map(Boolean))
  private _menuItemElRefs: QueryList<ElementRef>

  constructor(
    private readonly windowRef: WindowRef,
    private readonly location: Location,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly breakpointObserver: BreakpointObserver,
    @Inject(MASTER_DETAIL_DATA) private readonly data: MasterDetailData,
  ) {
    this.items$ = this.data.items$.pipe(shareReplay(1))

    this.activeMenuItemIndex$ = this.items$.pipe(
      switchMap((items) =>
        this.router.events.pipe(
          filterIfInstanceOf(NavigationEnd),
          tap(() => {
            // handle the case, where navigation (toggling items) happens from menu
            if (this.route.snapshot.fragment?.startsWith(RouteFragment.SHOW_DETAIL)) {
              const ix = this.getActiveMenuItemIndex(items)
              const el = this.menuItemElRefs.toArray()[ix]
              const item = items[ix]
              this.toggleShowDetail(item, el.nativeElement, true, true)
              this.location.replaceState(this.location.path(false))
            }
          }),
          startWith(undefined),
          map(() => this.getActiveMenuItemIndex(items)),
        ),
      ),
    )
  }

  afterMenuItemsSet() {
    const showDetail = this.route.snapshot.fragment?.startsWith(RouteFragment.SHOW_DETAIL)

    this.menuItemElRefs.changes
      .pipe(
        map(() => this.menuItemElRefs.toArray()),
        withLatestFrom(this.items$, this.activeMenuItemIndex$),
        filter(([elRefs, items]) => elRefs.length === items.length),
        take(1),
      )
      .subscribe(([elRefs, items, ix]) => {
        if (showDetail) {
          this.location.replaceState(this.location.path(false))
          this.toggleShowDetail(items[ix], elRefs[ix].nativeElement, true, true)
        } else if (items.length === 1) {
          this.currentMenuItem$.next(items[0])
        }
      })

    fromEvent(this.menuScrollContainerElRef.nativeElement, 'scroll')
      .pipe(throttleTime(250, undefined, { leading: true, trailing: true }))
      .subscribe(this.onMenuScroll)
    setTimeout(this.onMenuScroll)
  }

  toggleShowDetail(menuItem: MasterDetailMenuItem, el: HTMLElement, isActive: boolean, forceShow = false) {
    const nextMenuItem = forceShow
      ? menuItem
      : this.currentMenuItem$.value?.pathArgs.every((pa, ix) => pa === menuItem.pathArgs[ix])
      ? null
      : menuItem
    if (isActive) {
      // if it's not already active, we'll toggle the class after the NavigationEnd event
      // toggle visibility class instantly (only applies on mobile)
      this.showContent(el, nextMenuItem)
    } else {
      // since the content is loading async, we await the route navigation to be finished before showing the content / scrolling
      // (which would fail otherwise)
      this.router.events
        .pipe(filterIfInstanceOf(NavigationEnd), first())
        .subscribe(() => this.showContent(el, nextMenuItem))
    }
  }

  private showContent(el: HTMLElement, nextMenuItem: MasterDetailMenuItem | null) {
    // toggle visibility class (only applies on mobile)
    this.currentMenuItem$.next(nextMenuItem)
    // scroll to El on mobile is menu item, otherwise detail container
    const isMobile = this.breakpointObserver.isMatched(`(max-width: ${Breakpoints.MAX_SM}px)`)
    const scrollToEl = isMobile ? el : <HTMLElement>this.detailContainerRef.nativeElement
    // always scroll (with setTimeout; since we first need have the new dom changes applied)
    const currentHeaderHeight = this.data.stickyHeaderEl?.offsetHeight || 0
    if (this.windowRef.nativeWindow) {
      setTimeout(scrollIntoView.bind(void 0, this.windowRef.nativeWindow, scrollToEl, currentHeaderHeight))
    }
  }

  private readonly onMenuScroll = () => {
    const el = this.menuScrollContainerElRef.nativeElement
    const showBefore = el.scrollTop > 0
    const showAfter = el.scrollTop + el.clientHeight < el.scrollHeight
    this.menuWrapperElRef.nativeElement.classList.toggle('master-detail__menu--scroll-indicator-top', showBefore)
    this.menuWrapperElRef.nativeElement.classList.toggle('master-detail__menu--scroll-indicator-bottom', showAfter)
  }

  private readonly getActiveMenuItemIndex = (items: MasterDetailMenuItem[]): number => {
    const navExtras: NavigationExtras = { relativeTo: this.route, queryParamsHandling: 'preserve' }

    for (let ix = 0; ix < items.length; ix++) {
      const isActive = this.router.isActive(this.router.createUrlTree(items[ix].pathArgs, navExtras), true)
      if (isActive) {
        return ix
      }
    }
    return 0
  }
}
