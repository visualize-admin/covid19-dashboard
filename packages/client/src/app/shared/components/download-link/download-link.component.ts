import { BreakpointObserver } from '@angular/cdk/layout'
import { Overlay, OverlayConfig, OverlayPositionBuilder } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { DOCUMENT } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ContentChildren,
  ElementRef,
  Inject,
  Injector,
  Input,
  QueryList,
  ViewEncapsulation,
} from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { filterIfInstanceOf } from '@shiftcode/ngx-core'
import { fromEvent, merge, Observable } from 'rxjs'
import { filter, takeUntil } from 'rxjs/operators'
import { Breakpoints } from '../../../static-utils/breakpoints.enum'
import { isElChildOf } from '../../../static-utils/is-el-child-of.function'
import { scrollThreshold$ } from '../../../static-utils/scroll-threshold-observable.function'
import { DownloadLinkItemDirective } from './download-link-item.directive'
import { DownloadModalRef } from './download-modal-ref'
import { DOWNLOAD_MODAL_DATA } from './download-modal/download-modal-data.token'
import { DownloadModalComponent, DownloadModalData } from './download-modal/download-modal.component'

@Component({
  selector: 'bag-download-link',
  templateUrl: './download-link.component.html',
  styleUrls: ['./download-link.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadLinkComponent {
  @Input()
  type: 'download' | 'share' | 'dailyReport' = 'download'

  @Input()
  fileDescription: string

  @Input()
  iconUrl?: string

  @ContentChildren(DownloadLinkItemDirective)
  linkItems: QueryList<DownloadLinkItemDirective>

  private ref: DownloadModalRef | null = null

  constructor(
    private readonly overlay: Overlay,
    private readonly router: Router,
    readonly elRef: ElementRef,
    @Inject(DOCUMENT) private readonly doc: Document,
    private readonly breakpointObserver: BreakpointObserver,
    private overlayPositionBuilder: OverlayPositionBuilder,
    private readonly injector: Injector,
  ) {}

  readonly toggle = () => {
    if (this.ref) {
      this.close()
    } else {
      this.open()
    }
  }

  private readonly close = () => {
    if (this.ref) {
      this.ref.close()
    }
  }

  private readonly open = () => {
    const data: DownloadModalData = {
      linkItems: this.linkItems,
      fileDescription: this.fileDescription,
      type: this.type,
    }

    const injector = Injector.create({
      parent: this.injector,
      providers: [{ provide: DOWNLOAD_MODAL_DATA, useValue: data }],
    })
    const isMobile = this.breakpointObserver.isMatched(`(max-width: ${Breakpoints.MAX_SM}px)`)
    const overlayRef = this.overlay.create(this.getOverlayConfig(isMobile))
    const containerPortal = new ComponentPortal(DownloadModalComponent, null, injector)
    const componentRef: ComponentRef<DownloadModalComponent> = overlayRef.attach(containerPortal)
    const ref = new DownloadModalRef(overlayRef)
    componentRef.instance.ref = ref

    // differ closing events to watch for mobile non mobile
    let closeObs$: Observable<any>[] = [overlayRef.backdropClick()]
    if (!isMobile) {
      closeObs$ = [
        ...closeObs$,
        fromEvent<MouseEvent>(this.doc, 'click').pipe(
          filter((ev) => {
            return isElChildOf(<HTMLElement>ev.target, componentRef.instance.element)
          }),
        ),
        fromEvent(window, 'resize'),
        scrollThreshold$(this.doc, 100),
      ]
    }

    setTimeout(() => {
      merge(...closeObs$)
        .pipe(takeUntil(ref.close$))
        .subscribe(ref.close)
    })

    this.router.events.pipe(takeUntil(ref.close$), filterIfInstanceOf(NavigationEnd)).subscribe(ref.close)

    ref.close$.subscribe(() => (this.ref = null))
    this.ref = ref
  }

  private getOverlayConfig(isMobile: boolean): OverlayConfig {
    // test whether mobile or not
    const positionStrategy = isMobile
      ? this.overlay.position().global().bottom('0')
      : this.overlayPositionBuilder.flexibleConnectedTo(this.elRef).withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
          },
        ])

    const scrollStrategy = isMobile ? this.overlay.scrollStrategies.block() : this.overlay.scrollStrategies.reposition()

    return new OverlayConfig({ hasBackdrop: isMobile, scrollStrategy, positionStrategy })
  }
}
