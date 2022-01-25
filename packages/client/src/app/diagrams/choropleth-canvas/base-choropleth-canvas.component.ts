import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Platform } from '@angular/cdk/platform'
import { DOCUMENT } from '@angular/common'
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { D3ZoomEvent, geoMercator, geoPath, zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from 'd3'
import { BehaviorSubject, fromEvent, merge, Observable, of, Subject } from 'rxjs'
import { distinctUntilChanged, filter, repeatWhen, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators'
import { DPR } from '../../core/dpr.token'
import { D3CanvasComponent } from '../../shared/components/d3-canvas/d3-canvas.component'
import { isElChildOf } from '../../static-utils/is-el-child-of.function'
import {
  ChoroplethGeoFeature,
  ChoroplethGeoFeatureCollection,
  MercatorProjection,
} from '../choropleth/base-choropleth.component'
import { singleTouchHint } from '../utils'
import { colorGenerator } from './color.generator'
import { Path2dContext } from './path-2d-context'

export interface CanvasChoroplethEventData<T = any> {
  source: DOMPoint
  unit: string
  properties: T
}

@Component({ template: '' })
export abstract class BaseChoroplethCanvasComponent<T> implements OnChanges, AfterViewInit, OnDestroy {
  static readonly AFTER_RENDERING_EV = 'ChoroplethAfterRendering'

  @Input()
  extendedFeatureCollection: ChoroplethGeoFeatureCollection<T>

  @Input()
  set zoomSpaced(val: boolean | string) {
    this._zoomSpaced = coerceBooleanProperty(val)
  }

  get zoomSpaced() {
    return this._zoomSpaced
  }

  @Output()
  featureFocus = new EventEmitter<CanvasChoroplethEventData<T>>()

  @Output()
  featureBlur = new EventEmitter<void>()

  @ViewChild('mainCanvas', { static: true, read: D3CanvasComponent })
  d3Canvas: D3CanvasComponent

  @ViewChild('hiddenCanvas', { static: true, read: ElementRef })
  hiddenD3CanvasRef: ElementRef<HTMLCanvasElement>
  hiddenD3Canvas: HTMLCanvasElement

  @ViewChild('hiddenSvg', { static: true, read: ElementRef })
  hiddenSvgRef: ElementRef<SVGSVGElement>
  hiddenSvg: SVGSVGElement

  protected initialized = false
  readonly isZoomed$: Observable<boolean>
  readonly showTouchHint$: Observable<boolean>
  protected readonly projection: MercatorProjection = <MercatorProjection>geoMercator()
  protected readonly pathGenerator = geoPath(this.projection)
  protected readonly onDestroy = new Subject<void>()
  protected zoomHandler: ZoomBehavior<Element, unknown>
  protected currentTransform: ZoomTransform | null = null

  protected hiddenBgColor: string
  protected colorMap: Record<string, ChoroplethGeoFeature> = {}

  private prevActiveFeat: ChoroplethGeoFeature | null = null
  private prevMapExtent: [[number, number], [number, number]]
  private _zoomSpaced: boolean
  private geoPaths: Record<string, Path2dContext> = {}
  private readonly isZoomedSubject = new BehaviorSubject(false)
  private readonly showTouchHintSubject = new BehaviorSubject(false)

  constructor(
    protected readonly ngZone: NgZone,
    protected readonly platform: Platform,
    protected elRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) protected readonly doc: Document,
    @Inject(DPR) private readonly dpr: number,
  ) {
    const outsideClick$ = fromEvent<UIEvent>(this.doc, 'click').pipe(
      filter((ev) => isElChildOf(<Element>ev.target, elRef.nativeElement)),
      take(1),
    )

    of(void 0)
      .pipe(
        repeatWhen(() => this.featureBlur),
        switchMap(() => this.featureFocus.pipe(take(1))),
        switchMap(() => outsideClick$),
        takeUntil(this.onDestroy),
      )
      .subscribe(() => this.blurActiveFeat())

    this.showTouchHint$ = this.showTouchHintSubject.asObservable().pipe(distinctUntilChanged())
    this.isZoomed$ = this.isZoomedSubject.asObservable()
  }

  protected abstract getFill(feature: ChoroplethGeoFeature<T>): string | null

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized && this.d3Canvas.isVisible) {
      this.paint()
    }
  }

  ngAfterViewInit() {
    this.hiddenD3Canvas = this.hiddenD3CanvasRef.nativeElement
    this.hiddenSvg = this.hiddenSvgRef.nativeElement
    if (this.platform.isBrowser) {
      this.setupChart()
      // repaint$ completes on destroy, no need for takeUntil
      this.d3Canvas.repaint$
        .pipe(
          tap(({ width, height }) => {
            this.hiddenD3Canvas.setAttribute('width', width.toString())
            this.hiddenD3Canvas.setAttribute('height', height.toString())
          }),
          switchMap(() => merge(this.featureFocus, this.featureBlur).pipe(startWith(null))),
          tap(this.paint.bind(this)),
        )
        .subscribe()
      setTimeout(() => (this.initialized = true))
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  changeZoom(k: number) {
    // reset zoom if min zoom is reached
    if (this.currentTransform !== null && this.currentTransform.k * k <= 1) {
      this.resetZoom()
    } else {
      // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
      this.d3Canvas.canvas.transition().call(this.zoomHandler.scaleBy, k)
    }
  }

  resetZoom() {
    // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
    this.d3Canvas.canvas.transition().call(this.zoomHandler.transform, zoomIdentity.translate(0, 0).scale(1))
  }

  protected setupChart() {
    this.zoomHandler = zoom()
      .scaleExtent([1, 10])
      .filter(() => {
        // prevent movement if zoom level is 1
        if (this.currentTransform === null) {
          return false
        } else {
          return this.currentTransform.k !== 1
        }
      })
      .on('zoom', <any>this.onZooming)

    this.d3Canvas.canvas.call(<any>this.zoomHandler).on('wheel.zoom', null)
    this.d3Canvas.canvasEl.addEventListener('mousemove', this.onPointerEvent)
    this.d3Canvas.canvasEl.addEventListener('click', this.onPointerEvent)

    singleTouchHint(this.d3Canvas.canvasEl, this.showTouchHintSubject).pipe(takeUntil(this.onDestroy)).subscribe()
  }

  protected paint(): void {
    const { k, x, y } = this.currentTransform || { k: 1, x: 0, y: 0 }
    const [tx, ty] = [x * this.d3Canvas.pixelRatio, y * this.d3Canvas.pixelRatio]
    const mapExtent: [[number, number], [number, number]] = [
      [tx, ty],
      [this.d3Canvas.width * k + tx, this.d3Canvas.height * k + ty],
    ]

    if (this.prevMapExtent !== mapExtent) {
      this.prevMapExtent = mapExtent
      this.projection.fitExtent(mapExtent, this.extendedFeatureCollection)
      this.geoPaths = this.extendedFeatureCollection.features.reduce<Record<string, Path2dContext>>((u, feature) => {
        const pathCtx = new Path2dContext()
        this.pathGenerator.context(pathCtx)(feature)
        u[feature.unit] = pathCtx
        return u
      }, {})
      this.paintHidden()
    }
    this.paintActual()
    this.dispatchAfterRenderingEvent()
  }

  protected paintActual() {
    const ctx = this.d3Canvas.context

    ctx.clearRect(0, 0, this.d3Canvas.width, this.d3Canvas.height)
    for (const feature of this.extendedFeatureCollection.features) {
      ctx.lineWidth = 1
      ctx.strokeStyle = '#fff'
      ctx.fillStyle = this.getFill(feature) || 'transparent'
      ctx.stroke(this.geoPaths[feature.unit])
      ctx.fill(this.geoPaths[feature.unit])
    }
    if (this.prevActiveFeat) {
      ctx.lineWidth = 2
      ctx.strokeStyle = '#000'
      ctx.stroke(this.geoPaths[this.prevActiveFeat.unit])
    }
  }

  protected paintHidden(): void {
    const colorMap: Record<string, ChoroplethGeoFeature> = {}
    const ctx = <CanvasRenderingContext2D>this.hiddenD3Canvas.getContext('2d')

    ctx.clearRect(0, 0, this.hiddenD3Canvas.width, this.hiddenD3Canvas.height)
    const color = colorGenerator()
    this.hiddenBgColor = <string>color.next().value
    ctx.rect(0, 0, this.hiddenD3Canvas.width, this.hiddenD3Canvas.height)
    ctx.fillStyle = this.hiddenBgColor
    ctx.fill()
    for (const feature of this.extendedFeatureCollection.features) {
      const fill = color.next().value
      if (!fill) {
        throw new Error('out of colors')
      }
      colorMap[fill] = feature
      ctx.fillStyle = fill
      ctx.fill(this.geoPaths[feature.unit])
    }
    this.colorMap = colorMap
  }

  private readonly onZooming = (event: D3ZoomEvent<any, any>): void => {
    this.blurActiveFeat()
    this.currentTransform = event.transform
    this.isZoomedSubject.next(
      this.currentTransform.k !== 1 || this.currentTransform.y !== 0 || this.currentTransform.x !== 0,
    )
    this.paint()
  }

  private readonly onPointerEvent = (ev: MouseEvent) => {
    const [x, y] = [ev.offsetX, ev.offsetY]
    const ctx = <CanvasRenderingContext2D>this.hiddenD3Canvas.getContext('2d')
    const [r, g, b] = ctx.getImageData(x * this.dpr, y * this.dpr, 1, 1).data
    const rgb = `rgb(${r},${g},${b})`
    const feat = this.colorMap[rgb] || null
    if (rgb === this.hiddenBgColor && this.prevActiveFeat) {
      this.blurActiveFeat()
    } else if (feat !== this.prevActiveFeat) {
      this.prevActiveFeat = feat
      if (feat) {
        const tooltipPos = <[number, number]>this.projection(feat.tooltipPosition)
        const rect: DOMRect = this.hiddenSvg.getBoundingClientRect()
        const point = this.hiddenSvg.createSVGPoint()
        // projection works with dpr - therefore we need to undo the dpr
        point.x = tooltipPos[0] / this.dpr
        point.y = tooltipPos[1] / this.dpr
        const source: DOMPoint = point.matrixTransform(<DOMMatrixInit>this.hiddenSvg.getScreenCTM())
        source.x = Math.min(Math.max(source.x, rect.x), rect.x + rect.width)
        source.y = Math.min(Math.max(source.y, rect.y), rect.y + rect.height)

        this.featureFocus.next({ unit: feat.unit, properties: feat.properties, source })
      }
    }
  }

  private blurActiveFeat() {
    this.prevActiveFeat = null
    this.featureBlur.next()
  }

  private dispatchAfterRenderingEvent() {
    const ev = new Event(BaseChoroplethCanvasComponent.AFTER_RENDERING_EV, { bubbles: true })
    this.elRef.nativeElement.dispatchEvent(ev)
  }
}
