import { DOCUMENT, isPlatformBrowser } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
import { isDefined } from '@c19/commons'
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs'
import { map, shareReplay, takeUntil, tap } from 'rxjs/operators'
import { DPR } from '../../core/dpr.token'
import { ResizeService } from '../../core/resize.service'

export interface HeatmapRowEntry {
  /* color of rect */
  color: string
  /* height of rect in percentage. default 100% */
  height?: number // default 100%
}

interface SizeObj {
  width: number
  height: number
  nativeWidth: number
  nativeHeight: number
}

const DEFAULT_HEIGHT = 50

@Component({
  selector: 'bag-heatmap-row',
  templateUrl: './heatmap-row.component.html',
  styleUrls: ['./heatmap-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--canvas-height.px]': 'height',
  },
})
export class HeatmapRowComponent implements OnInit, OnDestroy {
  static readonly AFTER_RENDERING_EV = 'HeatmapRowAfterRendering'

  @Input()
  set height(val: number) {
    this._height = val > 0 ? val : DEFAULT_HEIGHT
  }

  get height() {
    return this._height || DEFAULT_HEIGHT
  }

  @Input()
  set entries(val: HeatmapRowEntry[] | null) {
    this.entriesSubject.next(val)
  }

  get entries() {
    return this.entriesSubject.value
  }

  @Input()
  set selectedIndex(value: number | null) {
    this.selectedIndexSubject.next(value)
  }

  get selectedIndex(): number | null {
    return this.selectedIndexSubject.value
  }

  readonly element: HTMLElement

  @ViewChild('canvasElRef', { read: ElementRef, static: true })
  readonly canvasElRef: ElementRef<HTMLCanvasElement>

  triangleTransformX$: Observable<{ rel: number } | null>

  private readonly onDestroy = new Subject<void>()
  private readonly entriesSubject = new BehaviorSubject<HeatmapRowEntry[] | null>(null)
  private readonly selectedIndexSubject = new BehaviorSubject<number | null>(null)

  private _height: number

  private data$ = this.entriesSubject.asObservable()
  private selectedIndex$ = this.selectedIndexSubject.asObservable()
  private size$: Observable<SizeObj>

  constructor(
    @Inject(DOCUMENT) doc: Document,
    elementRef: ElementRef<HTMLElement>,
    @Inject(DPR) private readonly dpr: number,
    private readonly resizeService: ResizeService,
    @Inject(PLATFORM_ID) private readonly platformId: any,
  ) {
    this.element = elementRef.nativeElement

    this.size$ = this.resizeService.observe(this.element).pipe(
      map(() => ({
        width: this.element.clientWidth,
        height: this.height,
        nativeWidth: this.element.clientWidth * this.dpr,
        nativeHeight: this.height * this.dpr,
      })),
      shareReplay(1),
    )

    this.triangleTransformX$ = combineLatest([this.selectedIndex$, this.data$]).pipe(
      map(([selectedIndex, entries]) => {
        if (!isDefined(entries) || !isDefined(selectedIndex)) {
          return null
        }
        const count = entries.length
        if (0 <= selectedIndex && selectedIndex < count) {
          return { rel: (selectedIndex / count) * 100 + 50 / count }
        } else {
          return null
        }
      }),
    )
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      combineLatest([this.data$, this.size$.pipe(tap(this.updateCanvasDimension.bind(this)))])
        .pipe(takeUntil(this.onDestroy))
        .subscribe(this.draw.bind(this))
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  private updateCanvasDimension({ width, height, nativeWidth, nativeHeight }: SizeObj) {
    const canvas = this.canvasElRef.nativeElement
    canvas.width = nativeWidth
    canvas.height = nativeHeight
    canvas.style.height = `${height}px`
  }

  private draw([entries, { nativeWidth, nativeHeight }]: [HeatmapRowEntry[] | null, SizeObj]) {
    const ctx: CanvasRenderingContext2D | null = this.canvasElRef.nativeElement.getContext('2d')
    if (!ctx) {
      return
    }

    ctx.clearRect(0, 0, nativeWidth, nativeHeight)
    if (!entries) {
      return
    }

    const count = entries.length
    for (let i = 0; i < count; i++) {
      const entry = entries[i]
      const xs = Math.round((i / count) * nativeWidth)
      const xe = Math.round(((i + 1) / count) * nativeWidth)
      ctx.beginPath()
      ctx.fillStyle = entry.color
      const [y, h] = entry.height
        ? [nativeHeight - (nativeHeight / 100) * entry.height, (nativeHeight / 100) * entry.height]
        : [0, nativeHeight]
      ctx.rect(xs, y, xe - xs, h)
      ctx.fill()
    }
    this.dispatchAfterRenderingEvent()
  }

  private dispatchAfterRenderingEvent() {
    const ev = new Event(HeatmapRowComponent.AFTER_RENDERING_EV, { bubbles: true })
    this.element.dispatchEvent(ev)
  }
}
