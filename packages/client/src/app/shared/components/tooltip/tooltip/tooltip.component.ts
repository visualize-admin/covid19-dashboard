import { animate, state, style, transition, trigger } from '@angular/animations'
import { ConnectedOverlayPositionChange } from '@angular/cdk/overlay'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  HostBinding,
  Inject,
  Injector,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core'
import { TOOLTIP_INNER_DATA, BaseTooltipContentComponent } from '../base-tooltip-content.component'
import { TOOLTIP_DATA } from '../tooltip-data.token'

export interface TooltipBaseData {
  type: 'cmp' | 'tpl'
}

export interface TooltipCmpData<X = any, C extends BaseTooltipContentComponent<X> = any> extends TooltipBaseData {
  type: 'cmp'
  component: Type<C>
  componentData?: X
}

export interface TooltipTplData<T = any> extends TooltipBaseData {
  type: 'tpl'
  templateRef: TemplateRef<T>
  templateCtx?: T
}

export type TooltipData = TooltipCmpData | TooltipTplData

// tslint:disable:no-host-metadata-property
@Component({
  selector: 'bag-tooltip',
  template: `
    <div class="tooltip__inner">
      <ng-container #vc></ng-container>
    </div>
  `,
  styleUrls: ['./tooltip.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('appearance', [
      state('enter', style({ transform: 'none', opacity: 1 })),
      state('void', style({ transform: 'translate3d(0, 0, 0) scale(0.95)', opacity: 0 })),
      transition('* => *', animate('250ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
    ]),
  ],
})
export class TooltipComponent implements AfterViewInit {
  @ViewChild('vc', { read: ViewContainerRef })
  viewRef: ViewContainerRef

  @HostBinding('@appearance') state: 'void' | 'enter' = 'enter'

  readonly element: HTMLElement
  private readonly modifierClasses: string[] = []
  private componentRef?: ComponentRef<BaseTooltipContentComponent<any>>

  constructor(
    @Inject(TOOLTIP_DATA) private tooltipData: TooltipData,
    private readonly factoryResolver: ComponentFactoryResolver,
    private readonly injector: Injector,
    elementRef: ElementRef,
  ) {
    this.element = elementRef.nativeElement
  }

  update(tooltipData: TooltipData) {
    this.tooltipData = tooltipData
    this.updateView()
  }

  ngAfterViewInit() {
    this.updateView()
  }

  positionUpdated({ connectionPair: { overlayX, overlayY, originX, originY } }: ConnectedOverlayPositionChange) {
    this.element.classList.remove(...this.modifierClasses.splice(0, this.modifierClasses.length))
    let position = 'unknown'
    let alignment = 'unknown'

    const xAlignment = `${originX}-${overlayX}`
    const yAlignment = `${originY}-${overlayY}`

    if (xAlignment === 'end-start') {
      // tooltip is right of origin (--> left arrow)
      position = 'left'
      alignment = `y-${overlayY}`
    } else if (xAlignment === 'start-end') {
      // tooltip is left of origin (--> right arrow)
      position = 'right'
      alignment = `y-${overlayY}`
    } else if (yAlignment === 'top-bottom') {
      // tooltip is above (--> bottom tooltip)
      position = 'bottom'
      alignment = `x-${overlayX}`
    } else if (yAlignment === 'bottom-top') {
      // tooltip is below (--> top-tooltip)
      position = 'top'
      alignment = `x-${overlayX}`
    } else {
      // not supported
    }
    this.modifierClasses.push(`tooltip--arrow-${position}`, `tooltip--arrow-${alignment}`)
    this.element.classList.add(...this.modifierClasses)
  }

  private updateView() {
    if (this.tooltipData.type === 'cmp') {
      if (this.componentRef && this.componentRef.instance instanceof this.tooltipData.component) {
        // update
        this.componentRef.instance.update(this.tooltipData.componentData)
      } else {
        // create new
        const cmpFactory = this.factoryResolver.resolveComponentFactory(this.tooltipData.component)
        const newInjector = Injector.create({
          parent: this.injector,
          providers: [{ provide: TOOLTIP_INNER_DATA, useValue: this.tooltipData.componentData }],
        })
        this.viewRef.clear()
        this.componentRef = this.viewRef.createComponent(cmpFactory, 0, newInjector)
        // needs to be sync (so don't use markForCheck)
        this.componentRef.changeDetectorRef.detectChanges()
      }
    } else {
      this.viewRef.clear()
      const ref = this.viewRef.createEmbeddedView(this.tooltipData.templateRef, this.tooltipData.templateCtx)
      // needs to be sync (so don't use markForCheck)
      ref.detectChanges()
    }
  }
}
