import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { fromEvent, merge, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { TooltipService } from '../tooltip/tooltip.service'

@Component({
  selector: 'bag-info-tooltip',
  template: `
    <ng-template #tooltipRef let-text="text">
      <div class="info-tooltip">{{ text }}</div>
    </ng-template>
    <ng-content></ng-content>
    <sc-svg #iconElRef [class.info-tooltip__icon--md]="sizeMd" url="/assets/icon/ic_info-2.svg"></sc-svg>
  `,
  styleUrls: ['./info-tooltip.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoTooltipComponent implements AfterViewInit, OnDestroy {
  @Input()
  text: string

  @Input()
  sizeMd?: boolean

  @ViewChild('tooltipRef', { static: true, read: TemplateRef })
  tooltipRef: TemplateRef<{ text: string }>

  @ViewChild('iconElRef', { static: true, read: ElementRef })
  iconElRef: ElementRef

  private readonly onDestroy = new Subject<void>()

  constructor(private readonly elementRef: ElementRef, private readonly tooltipService: TooltipService) {}

  ngAfterViewInit() {
    const mouseEnter$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseenter')
    const mouseLeave$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseleave')
    const touchStart$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'touchstart')

    merge(mouseEnter$, touchStart$).pipe(takeUntil(this.onDestroy)).subscribe(this.showTooltip)
    mouseLeave$.pipe(takeUntil(this.onDestroy)).subscribe(this.hideTooltip)
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  private readonly showTooltip = () => {
    this.tooltipService.showTpl(
      this.iconElRef.nativeElement,
      this.tooltipRef,
      { text: this.text },
      { position: ['above', 'below'], offsetY: 12 },
    )
  }
  private readonly hideTooltip = () => {
    this.tooltipService.hide()
  }
}
