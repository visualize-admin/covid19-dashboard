import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { Platform } from '@angular/cdk/platform'
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { isDefined } from '@c19/commons'
import { WindowRef } from '@shiftcode/ngx-core'
import {
  D3ZoomEvent,
  ExtendedFeature,
  ExtendedFeatureCollection,
  GeoGeometryObjects,
  geoMercator,
  geoPath,
  GeoProjection,
  select,
  Selection,
  zoom,
  ZoomBehavior,
  zoomIdentity,
} from 'd3'
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs'
import { debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators'
import {
  COLOR_CHOROPLETH_STROKE,
  COLOR_CHOROPLETH_STROKE_HOVER,
  COLOR_CHOROPLETH_STROKE_SELECTED,
} from '../../shared/commons/colors.const'
import { D3SvgComponent } from '../../shared/components/d3-svg/d3-svg.component'
import { singleTouchHint } from '../utils'

export interface GeoFeature<PROPS> extends Omit<ExtendedFeature<GeoGeometryObjects, PROPS>, 'id'> {
  id: number | string
  isRegion?: boolean
  tooltipPosition: [number, number]
}

export interface ChoroplethGeoFeature<PROPS = any> extends GeoFeature<PROPS> {
  // the item id used when providing the data
  unit: string
}

export type ExtendedGeoFeatureCollection<PROPS = never> = ExtendedFeatureCollection<GeoFeature<PROPS>>
export type ChoroplethGeoFeatureCollection<PROPS = never> = ExtendedFeatureCollection<ChoroplethGeoFeature<PROPS>>

/** @deprecated */
export interface ChoroplethData<T = any> {
  [unit: string]: T
}

export interface ChoroplethEventData<T = any> {
  source: Element | DOMPoint
  unit: string
  properties: T
}

export interface MercatorProjection extends GeoProjection {
  invert(point: [number, number]): [number, number] | null
}

export type ChoroplethZoomEvent = D3ZoomEvent<SVGGElement, unknown>

interface ChoroplethZoomSettings {
  k: number
  x: number
  y: number
}

@Component({ template: '' })
export abstract class BaseChoroplethComponent<T> implements OnChanges, AfterViewInit, OnDestroy {
  private static DEFAULT_ZOOM_SCALE_EXTENT: [number, number] = [1, 30] // min max zoom extent

  currentZoomLevel = 1

  @Input()
  set hideDropShadowFilter(value: boolean) {
    this._hideDropShadowFilter = coerceBooleanProperty(value)
  }

  get hideDropShadowFilter(): boolean {
    return this._hideDropShadowFilter
  }

  @Input()
  facet: 'print' | undefined | null

  @Input()
  zoomFacet: 'spaced' | undefined

  @Input()
  countriesWithRegion: string[] = []

  @Input()
  zoomMaxExtent: number | null

  @Input()
  zoomToSelection = false

  @Input()
  zoomGeoUnit: string | null // initial geo unit to zoom to (without selecting it)

  @Input()
  extendedFeatureCollection: ChoroplethGeoFeatureCollection<T>

  @Input()
  hideZoom: boolean

  @Input()
  strokeColor: string = COLOR_CHOROPLETH_STROKE

  @Input()
  set selectedGeoUnit(value: string | null) {
    this._selectedGeoUnit = value

    if (this.initialized && this.svg.isVisible) {
      this.selectGeoUnit()
    }
  }

  get selectedGeoUnit() {
    return this._selectedGeoUnit
  }

  @Output()
  readonly elTouchEnd = new EventEmitter<ChoroplethEventData<T>>()

  @Output()
  readonly elMouseEnter = new EventEmitter<ChoroplethEventData<T>>()

  @Output()
  readonly elClick = new EventEmitter<ChoroplethEventData<T>>()

  @Output()
  readonly elMouseLeave = new EventEmitter<ChoroplethEventData<T>>()

  @Output()
  readonly diagramMouseLeave = new EventEmitter<void>()

  @Output()
  readonly zoomedOrMoved = new EventEmitter<boolean>()

  @ViewChild(D3SvgComponent)
  svg: D3SvgComponent

  readonly initialVh: number

  readonly isZoomed$: Observable<boolean>
  readonly showTouchHint$: Observable<boolean>
  protected baseGroup: Selection<SVGGElement, void, null, undefined>
  protected initialized = false

  protected zoomHandler: ZoomBehavior<Element, unknown>
  protected readonly margin = { top: 4, right: 4, bottom: 4, left: 4 }
  protected readonly projection: MercatorProjection = <MercatorProjection>geoMercator()
  protected readonly pathGenerator = geoPath(this.projection)
  protected readonly onDestroy = new Subject<void>()

  private readonly showTouchHintSubject = new BehaviorSubject(false)
  private readonly isZoomedSubject = new BehaviorSubject(false)
  private _selectedGeoUnit: string | null
  private initialSettings: ChoroplethZoomSettings = { k: 1, x: 0, y: 0 }
  private _hideDropShadowFilter = false

  constructor(protected readonly ngZone: NgZone, protected readonly platform: Platform, winRef: WindowRef) {
    this.initialVh = winRef.nativeWindow?.innerHeight || 0
    this.showTouchHint$ = this.showTouchHintSubject.asObservable().pipe(distinctUntilChanged())
    this.isZoomed$ = this.isZoomedSubject.asObservable().pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap((val) => this.zoomedOrMoved.emit(val)),
    )
  }

  protected abstract getFill(feature: ChoroplethGeoFeature<T>): string | null

  protected abstract getMask(feature: ChoroplethGeoFeature<T>): string | null

  ngOnChanges(changes: SimpleChanges) {
    if (this.initialized && this.svg.isVisible) {
      this.paint()
    }
  }

  ngAfterViewInit(): void {
    this.setupChart()
    // repaint$ completes on destroy, no need for takeUntil
    this.svg.repaint$.subscribe(this.paint.bind(this))
    setTimeout(() => (this.initialized = true))

    fromEvent(<SVGGElement>this.baseGroup.node(), 'mouseleave')
      .pipe(takeUntil(this.onDestroy))
      .subscribe((ev) => this.diagramMouseLeave.emit())
  }

  ngOnDestroy(): void {
    this.onDestroy.next()
    this.onDestroy.complete()
  }

  applyInitialZoom() {
    const selection = this.baseGroup
      .selectAll<SVGPathElement, ChoroplethGeoFeature<T>>('path')
      .filter((datum) => datum.unit === this.zoomRelevantGeoUnit())

    if (this.zoomToSelection && this.zoomRelevantGeoUnit() && !selection.empty()) {
      this.resetZoom()

      const bounds = this.pathGenerator.bounds(selection.datum())
      const topLeft = bounds[1][0]
      const topRight = bounds[0][0]
      const bottomLeft = bounds[1][1]
      const bottomRight = bounds[0][1]

      const dx = topLeft - topRight
      const dy = bottomLeft - bottomRight
      const x = (topRight + topLeft) / 2
      const y = (bottomRight + bottomLeft) / 2

      const width = this.svg.width - this.margin.bottom
      const height = this.svg.height - this.margin.right
      const scale = Math.max(
        BaseChoroplethComponent.DEFAULT_ZOOM_SCALE_EXTENT[0],
        Math.min(this.zoomRelevantMaxExtent(), 0.9 / Math.max(dx / width, dy / height)),
      )

      const translate = [width / 2 - scale * x, height / 2 - scale * y]

      this.initialSettings = { k: scale, x: translate[0], y: translate[1] }

      this.svg.svg
        .transition()
        // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
        .call(this.zoomHandler.transform, zoomIdentity.translate(translate[0], translate[1]).scale(scale))
    } else {
      this.resetZoom()
      this.initialSettings = { k: 1, x: 0, y: 0 }
      this.svg.svg
        .transition()
        // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
        .call(this.zoomHandler.transform, zoomIdentity.translate(0, 0).scale(1))
    }
  }

  changeZoom(k: number) {
    // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
    this.svg.svg.transition().call(this.zoomHandler.scaleBy, k)
  }

  protected setupChart() {
    this.baseGroup = this.svg.svg
      .append('g')
      .attr('stroke', this.strokeColor)
      .attr('stroke-width', 1 / this.currentZoomLevel)
      .attr('stroke-linejoin', 'round')

    if (this.platform.isBrowser) {
      this.setupZoom()
    }
  }

  protected paint(): void {
    const mapExtent: [[number, number], [number, number]] = [
      [this.margin.top, this.margin.left],
      [this.svg.width - this.margin.bottom, this.svg.height - this.margin.right],
    ]

    this.projection.fitExtent(mapExtent, this.extendedFeatureCollection)
    this.baseGroup.attr('stroke', this.strokeColor)
    this.drawGeoUnits()
    this.applyInitialZoom()
    this.selectGeoUnit()
  }

  protected drawGeoUnits(): void {
    const geoUnits = this.baseGroup
      .selectAll<SVGPathElement, ChoroplethGeoFeature<T>>('path')
      .data(this.extendedFeatureCollection.features)
      .join('path')
      .attr('id', ({ id }) => `${id}`)
      .attr('d', this.pathGenerator)
      .attr('fill', this.getFill.bind(this))
      .attr('mask', this.getMask.bind(this))

    // no pointer events for countries with regions
    geoUnits.filter(this.isCountryWithRegions.bind(this)).attr('fill', 'none').attr('pointer-events', 'none')

    this.drawRegionStroke()
    this.raiseCountries()

    // HINT: events registered with d3 are NOT in ngZone
    geoUnits
      // remove any registered listeners
      // .on('touchstart', null)
      .on('mouseenter', null)
      .on('touchend', null)
      .on('click', null)
      .on('mouseleave', null)
      // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
      .on('mouseenter', this.onGeoUnitMouseEnter)
      // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
      .on('touchend', this.geoEventEmitter(this.elTouchEnd))
      // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
      .on('click', this.geoEventEmitter(this.elClick))
      // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
      .on('mouseleave', this.onGeoUnitMouseLeave)
  }

  protected selectGeoUnit(): void {
    this.baseGroup
      .selectAll<SVGPathElement, ChoroplethGeoFeature<T>>('path')
      .attr('filter', null)
      .filter(this.isCountry.bind(this)) // only possible to select countries
      .attr('stroke', null)
      .attr('stroke-width', null)
      .filter((datum) => datum.unit === this.selectedGeoUnit)
      .attr('stroke', COLOR_CHOROPLETH_STROKE_SELECTED)
      .attr('stroke-width', 2 / this.currentZoomLevel)
      .attr('filter', this.addDropShadowFilter.bind(this))
      .raise()
  }

  private setupZoom(): void {
    this.zoomHandler = zoom().scaleExtent(BaseChoroplethComponent.DEFAULT_ZOOM_SCALE_EXTENT)

    singleTouchHint(this.svg.svgEl, this.showTouchHintSubject).pipe(takeUntil(this.onDestroy)).subscribe()

    this.svg.svg
      .call(
        this.zoomHandler
          // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
          .on('start', this.onZoomStart)
          // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47296
          .on('zoom', this.onZooming),
      )
      .on('wheel.zoom', null)
  }

  protected isCountry(feature: ChoroplethGeoFeature<T>): boolean {
    return !feature.isRegion
  }

  protected addDropShadowFilter(): string | null {
    return this.hideDropShadowFilter ? null : this.svg.dropShadow
  }

  protected isRegion(feature: ChoroplethGeoFeature<T>): boolean {
    return !!feature.isRegion
  }

  protected isCountryWithRegions(feature: ChoroplethGeoFeature<T>): boolean {
    return this.countriesWithRegion.includes(feature.id.toString())
  }

  private raiseCountries() {
    this.baseGroup.selectAll<SVGPathElement, ChoroplethGeoFeature<T>>('path').filter(this.isCountry.bind(this)).raise()
  }

  private drawRegionStroke() {
    this.baseGroup
      .selectAll<SVGPathElement, ChoroplethGeoFeature<T>>('path')
      .filter(this.isRegion.bind(this))
      .attr('stroke', this.strokeColor)
      .attr('stroke-width', 0.5 / this.currentZoomLevel)
      .attr('pointer-events', null)
  }

  private readonly onGeoUnitMouseEnter = (event: MouseEvent, { unit, properties }: ChoroplethGeoFeature<T>) => {
    const geoUnitElement = <SVGPathElement>event.currentTarget
    const geoUnit = select<SVGPathElement, ChoroplethGeoFeature<T>>(geoUnitElement)

    const tooltipPos = <[number, number]>this.projection(geoUnit.datum().tooltipPosition)
    const point = this.svg.svgEl.createSVGPoint()
    point.x = tooltipPos[0]
    point.y = tooltipPos[1]

    const parent = select(<SVGGElement>geoUnit.node()?.parentNode)
    const rect: DOMRect = this.svg.svgEl.getBoundingClientRect()

    const anchor: DOMPoint = point.matrixTransform(<DOMMatrixInit>geoUnitElement.getScreenCTM())

    anchor.x = Math.min(Math.max(anchor.x, rect.x), rect.x + rect.width)
    anchor.y = Math.min(Math.max(anchor.y, rect.y), rect.y + rect.height)

    parent.raise()
    geoUnit.raise().attr('stroke', COLOR_CHOROPLETH_STROKE_HOVER)
    this.ngZone.run(() => this.elMouseEnter.emit({ source: anchor, unit, properties }))
  }

  private readonly onGeoUnitMouseLeave = (event: MouseEvent, { unit, properties }: ChoroplethGeoFeature<T>) => {
    this.ngZone.run(() => {
      this.elMouseLeave.emit({ source: <Element>event.target, unit, properties })
    })
    select(<SVGPathElement>event.currentTarget)
      .attr('stroke', this.strokeColor)
      .attr('filter', null)
    this.raiseCountries()
    this.selectGeoUnit()
  }

  private readonly geoEventEmitter = (emitter: EventEmitter<ChoroplethEventData<T>>) => {
    return (event: MouseEvent, { unit, properties }: ChoroplethGeoFeature<T>) => {
      this.ngZone.run(() => emitter.emit({ source: <Element>event.target, unit, properties }))
    }
  }

  private readonly onZoomStart = (): void => {
    // hide tooltip
    // this.ngZone.run(() => this.diagramMouseLeave.emit())
  }

  private readonly onZooming = (event: ChoroplethZoomEvent): void => {
    this.ngZone.run(() => this.diagramMouseLeave.emit())
    const { transform } = event
    this.ngZone.run(() => {
      this.applyZoom({ x: transform.x, y: transform.y, k: transform.k })
    })
  }

  private applyZoom(settings: ChoroplethZoomSettings) {
    if (isDefined(settings.k) && isDefined(settings.x) && isDefined(settings.y)) {
      this.currentZoomLevel = settings.k
      const changed =
        settings.k !== this.initialSettings.k ||
        settings.x !== this.initialSettings.x ||
        settings.y !== this.initialSettings.y
      this.isZoomedSubject.next(changed)
      this.baseGroup
        .attr('transform', `translate(${settings.x},${settings.y}) scale(${settings.k})`)
        .attr('stroke-width', 1 / this.currentZoomLevel)
      this.drawRegionStroke()
      this.raiseCountries()
      this.selectGeoUnit()
    }
  }

  private zoomRelevantGeoUnit(): null | string {
    return this._selectedGeoUnit || this.zoomGeoUnit
  }

  private zoomRelevantMaxExtent(): number {
    if (
      isDefined(this.zoomMaxExtent) &&
      this.zoomMaxExtent > 0 &&
      this.zoomMaxExtent <= BaseChoroplethComponent.DEFAULT_ZOOM_SCALE_EXTENT[1]
    ) {
      return this.zoomMaxExtent
    } else {
      return BaseChoroplethComponent.DEFAULT_ZOOM_SCALE_EXTENT[1]
    }
  }

  private resetZoom(reset = false) {
    if (this.zoomHandler) {
      this.zoomHandler
        .translateExtent([
          [0, 0],
          [this.svg.width, this.svg.height],
        ])
        .extent([
          [0, 0],
          [this.svg.width, this.svg.height],
        ])
    }
  }
}
