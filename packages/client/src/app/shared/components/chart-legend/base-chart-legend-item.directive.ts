import {
  Directive,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { fromEvent, merge, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { TranslatorService } from '../../../core/i18n/translator.service'
import { ChartLegendComponent } from './chart-legend.component'

@Directive()
export abstract class BaseChartLegendItemDirective implements OnChanges, OnDestroy {
  @Input()
  tooltipKey?: string | null

  @ViewChild('iconElRef')
  iconElRef: ElementRef

  get hasTooltip() {
    return this.tooltipKey && this.translator.tryGet(this.tooltipKey) !== undefined
  }

  private readonly onDestroy = new Subject<void>()
  private readonly killTooltip = new Subject<void>()

  constructor(
    @Inject(forwardRef(() => ChartLegendComponent)) private readonly chartLegend: ChartLegendComponent,
    private readonly elementRef: ElementRef,
    private readonly translator: TranslatorService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('tooltipKey' in changes) {
      if (this.hasTooltip) {
        const mouseEnter$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseenter')
        const mouseLeave$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mouseleave')
        const touchStart$ = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'touchstart')

        merge(mouseEnter$, touchStart$)
          .pipe(takeUntil(merge(this.onDestroy, this.killTooltip)))
          .subscribe(() => {
            if (this.tooltipKey) {
              this.chartLegend.showHintTooltip(this.iconElRef.nativeElement, this.tooltipKey)
            }
          })
        mouseLeave$.pipe(takeUntil(merge(this.onDestroy, this.killTooltip))).subscribe(() => {
          this.chartLegend.hideTooltip()
        })
      }
    } else {
      this.killTooltip.next()
    }
  }

  ngOnDestroy(): void {
    this.killTooltip.complete()
    this.onDestroy.next()
    this.onDestroy.complete()
  }
}
