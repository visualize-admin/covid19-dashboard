import { Platform } from '@angular/cdk/platform'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core'
import { NavigationEnd, Router, RouterLinkActive } from '@angular/router'
import { filterIfInstanceOf } from '@shiftcode/ngx-core'
import { asyncScheduler, fromEvent, Observable, ReplaySubject, Subject } from 'rxjs'
import { distinctUntilChanged, observeOn, takeUntil, throttleTime } from 'rxjs/operators'
import { ResizeService } from '../../../core/resize.service'
import { clamp } from '../../../static-utils/clamp.function'
import { TabItemDirective } from './tab-item.directive'

@Component({
  selector: 'bag-tab-list',
  templateUrl: './tab-list.component.html',
  styleUrls: ['./tab-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ContentChildren(TabItemDirective)
  tabItems: QueryList<TabItemDirective>

  @ViewChild('scrollContainerElRef', { static: true, read: ElementRef })
  scrollContainerElRef: ElementRef<HTMLDivElement>

  @ViewChildren(RouterLinkActive, { emitDistinctChangesOnly: true })
  routerLinks: QueryList<RouterLinkActive>
  @ViewChildren(RouterLinkActive, { emitDistinctChangesOnly: true, read: ElementRef })
  routerLinksElRef: QueryList<ElementRef<HTMLLinkElement>>

  readonly opacityBeforeBtn$: Observable<boolean>
  readonly opacityAfterBtn$: Observable<boolean>

  private get scrollContainer(): HTMLDivElement {
    return this.scrollContainerElRef.nativeElement
  }

  private readonly onDestroy = new Subject<void>()
  private showBeforeBtnSubject = new ReplaySubject<boolean>(1)
  private showAfterBtnSubject = new ReplaySubject<boolean>(1)

  constructor(
    private readonly router: Router,
    private readonly resizeService: ResizeService,
    private readonly platform: Platform,
  ) {
    this.opacityBeforeBtn$ = this.showBeforeBtnSubject.asObservable().pipe(distinctUntilChanged())
    this.opacityAfterBtn$ = this.showAfterBtnSubject.asObservable().pipe(distinctUntilChanged())
  }

  ngOnInit() {
    fromEvent(this.scrollContainer, 'scroll')
      .pipe(takeUntil(this.onDestroy), throttleTime(250, undefined, { leading: true, trailing: true }))
      .subscribe(this.onScroll)
    setTimeout(this.onScroll)

    this.router.events
      .pipe(takeUntil(this.onDestroy), filterIfInstanceOf(NavigationEnd), observeOn(asyncScheduler))
      .subscribe(this.scrollActiveLinkIntoView)
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  ngAfterViewInit() {
    if (this.platform.isBrowser) {
      this.resizeService
        .observe(this.scrollContainer)
        .pipe(takeUntil(this.onDestroy), throttleTime(400, undefined, { leading: true, trailing: true }))
        .subscribe(() => {
          this.onScroll()
          setTimeout(this.scrollActiveLinkIntoView)
        })
    }
  }

  scroll(dir: 1 | -1) {
    const left = this.scrollContainer.scrollLeft + this.scrollContainer.clientWidth * 0.75 * dir
    this.scrollContainer.scroll({ left, behavior: 'smooth' })
  }

  private readonly onScroll = () => {
    this.showBeforeBtnSubject.next(this.scrollContainer.scrollLeft > 0)
    this.showAfterBtnSubject.next(
      this.scrollContainer.scrollLeft + this.scrollContainer.clientWidth < this.scrollContainer.scrollWidth,
    )
  }

  private readonly scrollActiveLinkIntoView = () => {
    const links = this.routerLinks.toArray()
    const activeElIx = links.findIndex((i) => i.isActive)
    if (activeElIx > 0) {
      const itemEl = this.routerLinksElRef.get(activeElIx)?.nativeElement.parentElement
      if (itemEl) {
        const left = getCenterAlignedLeftScrollPos(itemEl, this.scrollContainer)
        // we do not use `scrollIntoView` because it would also scroll the body vertically (which is not desired)
        this.scrollContainer.scrollTo({ left, behavior: 'smooth' })
      }
    }
  }
}

function getCenterAlignedLeftScrollPos(target: HTMLElement, frame: HTMLElement) {
  const targetRect = target.getBoundingClientRect()
  const frameRect = frame.getBoundingClientRect()
  const inlineScroll =
    frame.scrollLeft + (targetRect.left + targetRect.width / 2) - (frameRect.left + frameRect.width / 2)
  return clamp(0, frame.scrollWidth - frameRect.width, inlineScroll)
}
