import { Platform } from '@angular/cdk/platform'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { select, Selection } from 'd3'
import { Observable, Subject } from 'rxjs'
import { filter, map, share, takeUntil, tap, throttleTime } from 'rxjs/operators'
import { DPR } from '../../../core/dpr.token'
import { ResizeService } from '../../../core/resize.service'

@Component({
  selector: 'bag-d3-canvas',
  template: `
    <div
      class="d3-canvas"
      [class.d3-canvas--flex]="flex"
      [class.d3-canvas--ratio]="!flex"
      [style.--d3-canvas-min-h]="flex ? null : minHeight"
      [style.--d3-canvas-max-h]="flex ? null : maxHeight"
      [style.--d3-canvas-ratio-w]="flex ? null : ratio[0]"
      [style.--d3-canvas-ratio-h]="flex ? null : ratio[1]"
    >
      <canvas #canvasElRef></canvas>
    </div>
  `,
  styleUrls: ['./d3-canvas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class D3CanvasComponent implements OnInit, OnDestroy {
  @Input()
  ratio: [number, number] = [5, 3]

  @Input()
  flex = false

  @Input()
  minHeight = '0px'

  @Input()
  maxHeight: string

  @ViewChild('canvasElRef', { static: true, read: ElementRef })
  canvasElRef: ElementRef<HTMLCanvasElement>

  get canvasEl(): HTMLCanvasElement {
    return this._canvasEl
  }
  get canvas(): Selection<HTMLCanvasElement, void, null, undefined> {
    return this._canvasSelection
  }

  /** native width */
  width: number

  /** native height */
  height: number

  context: CanvasRenderingContext2D

  readonly element: HTMLElement

  get isVisible(): boolean {
    // easy solution to check if element is not `display:none`
    return this.element.offsetParent !== null
  }

  readonly repaint$: Observable<{ width: number; height: number }>

  private readonly onDestroy = new Subject<void>()
  private _canvasEl: HTMLCanvasElement
  private _canvasSelection: Selection<HTMLCanvasElement, void, null, undefined>

  constructor(
    elementRef: ElementRef,
    resizeService: ResizeService,
    protected readonly platform: Platform,
    @Inject(DPR) readonly pixelRatio: number,
  ) {
    this.element = elementRef.nativeElement
    this.repaint$ = resizeService.observe(this.element).pipe(
      takeUntil(this.onDestroy),
      throttleTime(400, undefined, { leading: true, trailing: true }),
      filter(() => this.isVisible),
      map(() => ({
        width: this.canvasEl.clientWidth * this.pixelRatio,
        height: this.canvasEl.clientHeight * this.pixelRatio,
      })),
      tap(this.updateDimensions),
      share(),
    )
  }

  ngOnInit() {
    this._canvasEl = this.canvasElRef.nativeElement
    if (this.platform.isBrowser) {
      this._canvasSelection = select(this.canvasEl)
      this.context = <CanvasRenderingContext2D>this.canvasEl.getContext('2d')
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  private readonly updateDimensions = ({ width, height }: { width: number; height: number }) => {
    this.width = width
    this.height = height
    this.canvasEl.setAttribute('width', width.toString())
    this.canvasEl.setAttribute('height', height.toString())
  }
}
