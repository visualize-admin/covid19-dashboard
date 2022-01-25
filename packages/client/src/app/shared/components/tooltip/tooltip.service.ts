import { ConnectedPosition, Overlay, OverlayConfig, OverlayContainer, OverlayRef } from '@angular/cdk/overlay'
import { Platform } from '@angular/cdk/platform'
import { ComponentPortal } from '@angular/cdk/portal'
import { ViewportRuler } from '@angular/cdk/scrolling'
import { DOCUMENT } from '@angular/common'
import { ComponentRef, ElementRef, Inject, Injectable, Injector, TemplateRef, Type } from '@angular/core'
import { takeUntil } from 'rxjs/operators'
import { BaseTooltipContentComponent } from './base-tooltip-content.component'
import { FlexibleConnectedPositionStrategy2 } from './flexible-connected-position-strategy-2'
import { TOOLTIP_DATA } from './tooltip-data.token'
import { TooltipCmpData, TooltipComponent, TooltipData, TooltipTplData } from './tooltip/tooltip.component'

export type TooltipPosition = 'above' | 'before' | 'after' | 'below'

export type ConnectedEl = ElementRef | Element | DOMPoint

export interface TooltipOptions {
  position?: TooltipPosition | TooltipPosition[]
  offsetY?: number
  offsetX?: number
  enablePointerEvents?: boolean
  maxWidth?: number
}

@Injectable()
export class TooltipService {
  private current: null | {
    positionStrategy: FlexibleConnectedPositionStrategy2
    overlayRef: OverlayRef
    tooltipComponent: TooltipComponent
  } = null

  constructor(
    private viewportRuler: ViewportRuler,
    @Inject(DOCUMENT) private document: Document,
    private platform: Platform,
    private overlayContainer: OverlayContainer,
    private readonly overlay: Overlay,
    private readonly injector: Injector,
  ) {}

  /** @deprecated use {@link TooltipService#showTpl} instead */
  show<T>(connectedEl: ConnectedEl, templateRef: TemplateRef<T>, templateCtx?: T, opts?: TooltipOptions) {
    this.showTpl(connectedEl, templateRef, templateCtx, opts)
  }

  showTpl<T>(connectedEl: ConnectedEl, templateRef: TemplateRef<T>, templateCtx?: T, opts?: TooltipOptions) {
    const tooltipData: TooltipTplData = {
      type: 'tpl',
      templateRef,
      templateCtx,
    }
    this._show(connectedEl, tooltipData, opts)
  }

  /**
   * show Component - provide translator as argument if the component requires so.
   */
  showCmp<D, C extends BaseTooltipContentComponent<D>>(
    component: Type<C>,
    connectedEl: ConnectedEl,
    componentData: D,
    opts?: TooltipOptions,
  ) {
    const tooltipData: TooltipCmpData = {
      type: 'cmp',
      component,
      componentData,
    }
    this._show(connectedEl, tooltipData, opts)
  }

  hide() {
    this.current?.overlayRef.detach()
    this.current = null
  }

  private _show<T>(connectedEl: ElementRef | Element | DOMPoint, tooltipData: TooltipData, opts?: TooltipOptions) {
    if (this.current) {
      this.current.tooltipComponent.update(tooltipData)
      this.current.positionStrategy.setOrigin(connectedEl)
      this.current.overlayRef.updateSize({})
      this.current.overlayRef.updatePosition()
    } else {
      const [positionStrategy, overlayConfig] = this.getOverlayConfig(
        connectedEl,
        opts?.position,
        opts?.offsetX,
        opts?.offsetY,
        opts?.enablePointerEvents,
        opts?.maxWidth,
      )

      const overlayRef = this.overlay.create(overlayConfig)
      const injector = Injector.create({
        parent: this.injector,
        providers: [{ provide: TOOLTIP_DATA, useValue: tooltipData }],
      })
      const containerPortal = new ComponentPortal(TooltipComponent, null, injector)
      const componentRef: ComponentRef<TooltipComponent> = overlayRef.attach(containerPortal)
      const tooltipComponent = componentRef.instance

      overlayRef.detachments().subscribe(this.reset)
      positionStrategy.positionChanges
        .pipe(takeUntil(overlayRef.detachments()))
        .subscribe((change) => tooltipComponent.positionUpdated(change))

      this.current = { positionStrategy, overlayRef, tooltipComponent }
    }
  }

  private getOverlayConfig(
    element: ElementRef | Element | DOMPoint,
    position: TooltipPosition | TooltipPosition[] = 'above',
    offsetX: number = 0,
    offsetY: number = 0,
    enablePointerEvents = false,
    maxWidth?: number,
  ): [FlexibleConnectedPositionStrategy2, OverlayConfig] {
    const above = {
      overlayY: 'bottom',
      originY: 'top',
      offsetY: -offsetY,
    } as const
    const below = {
      overlayY: 'top',
      originY: 'bottom',
      offsetY,
    } as const
    const before = {
      overlayX: 'end',
      originX: 'start',
      offsetX: -offsetX,
    } as const
    const after = {
      overlayX: 'start',
      originX: 'end',
      offsetX,
    } as const

    const positions: Record<TooltipPosition, ConnectedPosition[]> = {
      before: [
        { ...before, overlayY: 'center', originY: 'center' },
        { ...before, overlayY: 'bottom', originY: 'center' },
        { ...before, overlayY: 'top', originY: 'center' },
      ],
      after: [
        { ...after, overlayY: 'center', originY: 'center' },
        { ...after, overlayY: 'bottom', originY: 'center' },
        { ...after, overlayY: 'top', originY: 'center' },
      ],
      above: [
        { ...above, overlayX: 'center', originX: 'center' },
        { ...above, overlayX: 'end', originX: 'center' },
        { ...above, overlayX: 'start', originX: 'center' },
      ],
      below: [
        { ...below, overlayX: 'center', originX: 'center' },
        { ...below, overlayX: 'end', originX: 'center' },
        { ...below, overlayX: 'start', originX: 'center' },
      ],
    }

    // test whether mobile or not
    const positionStrategy = new FlexibleConnectedPositionStrategy2(
      element,
      this.viewportRuler,
      this.document,
      this.platform,
      this.overlayContainer,
    )
      .withViewportMargin(0)
      .withGrowAfterOpen(true)
      .withFlexibleDimensions(false)
      .withPositions(
        Array.isArray(position)
          ? position.reduce((u, p) => [...u, ...positions[p]], <ConnectedPosition[]>[])
          : positions[position],
      )

    const scrollStrategy = this.overlay.scrollStrategies.close({ threshold: 50 })

    const overlayConfig = new OverlayConfig({
      hasBackdrop: false,
      scrollStrategy,
      positionStrategy,
      maxWidth,
      panelClass: !enablePointerEvents ? 'bag-tooltip--panel-no-pointer-events' : undefined,
    })

    return [positionStrategy, overlayConfig]
  }

  private readonly reset = () => (this.current = null)
}
