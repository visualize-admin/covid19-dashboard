import { isDefined } from '@c19/commons'
import { tapLast, tapPrevious } from '@shiftcode/ngx-core'
import { ScaleBand, ScaleLinear, scaleLinear, ScaleTime, Selection, ticks } from 'd3'
import { fromEvent, merge, Observable, Subject } from 'rxjs'
import { distinctUntilChanged, filter, last, map, switchMap, takeUntil, tap } from 'rxjs/operators'
import { D3SvgComponent } from '../shared/components/d3-svg/d3-svg.component'
import { filterEventTarget } from '../static-utils/filter-event-target.operator'
import { HistogramBandEntry, middleOfDay } from './histogram/base-histogram.component'

export type Stringifyable = { toString(): string }

export function checkIntersection(rectA: ClientRect, rectB: ClientRect, margin: number = 0): boolean {
  return !(
    rectB.left - margin >= rectA.right ||
    rectB.right <= rectA.left - margin ||
    rectB.top - margin >= rectA.bottom ||
    rectB.bottom <= rectA.top - margin
  )
}

/**
 * intialize the observable subscription for "scrubbing" over a chart/histogram
 * then maps mouse/touch hovers to data entries and calls focus/blur the visual chart entries
 *
 * @param unsubscriber - the ngOnDestroy observable from the component
 * @param doc - the Document
 * @param svg - the SVG
 * @param overlayElement - an element for registerign the events (mouse-/touch enter/move/leave)
 * @param mapSvgPointToData - function which maps the dom point to a data entry
 * @param equalityCheck - checkFunction which returns true if two data entries are the same
 * @param mapDataToFocusData - function which maps a data-entry to all necessary info needed for the focus functions
 * @param setElIntoFocus - function to set the focus called with the `mapDataToFocusData` return value
 * @param setElOutOfFocus - function to remove the focus called with the `mapDataToFocusData` return value
 * @param cleanUpOnFocusLoss - function called after mouse leaves the overlay element
 */
export function initMouseListenerOnValueDomain<T, U>(
  unsubscriber: Observable<any>,
  doc: Document,
  svg: SVGSVGElement,
  overlayElement: Element,
  mapSvgPointToData: (point: DOMPoint) => T | undefined,
  equalityCheck: (a: T | undefined, b: T | undefined) => boolean,
  mapDataToFocusData: (val: T) => U,
  setElIntoFocus: (val: U) => void,
  setElOutOfFocus: (val: U) => void,
  cleanUpOnFocusLoss: () => void,
) {
  const [enter$, move$, leave$] = getEventObservablesForElement(overlayElement, doc)

  // basic: when enter$ emits, read all moving$ values until leave$ emits a value
  // concept: as long the mouse/touch is within the valueDomain, we show a tooltip
  enter$
    .pipe(
      takeUntil(unsubscriber),
      switchMap(() =>
        move$.pipe(
          takeUntil(leave$),
          map((ev) => mapPointerEventToDomPoint(svg, ev)),
          map(mapSvgPointToData),
          // distinctUntilChanged needs to be within this pipe
          //  otherwise when leaving and entering (mouse) the valueDomain at the same place
          //  the tooltip wouldn't be shown again
          distinctUntilChanged(equalityCheck),
          filter(isDefined),
          map(mapDataToFocusData),
          // mouse/touch left the valueDomain ==> setElOutFocus
          tapLast(setElOutOfFocus),
          tapLast(cleanUpOnFocusLoss), // --specific
        ),
      ),
      // before setting the next el into focus, move the previous out of focus
      tapPrevious(setElOutOfFocus),
    )
    .subscribe(setElIntoFocus)
}

export function getEventObservablesForElement(el: Element, doc: Document) {
  // merge mouse and touch together
  const enter$ = merge(
    fromEvent<MouseEvent>(el, 'mouseenter'),
    fromEvent<TouchEvent>(el, 'touchstart', { passive: true }),
  )
  const move$ = merge(fromEvent<MouseEvent>(el, 'mousemove'), fromEvent<TouchEvent>(el, 'touchmove', { passive: true }))
  const leave$ = merge(
    fromEvent<MouseEvent>(el, 'mouseleave'),
    fromEvent<TouchEvent>(doc.documentElement, 'touchstart', { passive: true }).pipe(filterEventTarget(el, false)),
  )
  return [enter$, move$, leave$] as const
}

export function mapPointerEventToDomPoint(svg: SVGSVGElement, event: MouseEvent | TouchEvent): DOMPoint {
  const point = svg.createSVGPoint()
  point.x = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
  point.y = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY
  return point.matrixTransform((<DOMMatrix>svg.getScreenCTM()).inverse())
}

export function createColorScale(colors: string[], numColors: number): string[] {
  const colorScale = scaleLinear<string, string>()
    .domain(ticks(0, 1, colors.length - 1))
    .range(colors)
  return ticks(0, 1, numColors - 1).map((tick) => <string>colorScale(tick))
}

export function invert<T extends Stringifyable>(scaleBand: ScaleBand<T>): (val: number) => T | undefined {
  const bandwidth = scaleBand.bandwidth()
  const domain = scaleBand.domain()
  return (val: number): T | undefined => domain[Math.floor(val / bandwidth)]
}

export function calcDomainEnd(range: number, tickCount: number): number {
  // calculate an initial guess at step size
  const tempStep = range / tickCount

  // get the magnitude of the step size
  const mag = Math.floor(Math.log10(tempStep))
  const magPow = Math.pow(10, mag)

  // calculate most significant digit of the new step size
  let magMsd = tempStep / magPow + 0.5

  // promote the MSD to either 1, 2, or 5
  if (magMsd > 5.0) {
    magMsd = 10.0
  } else if (magMsd > 2.0) {
    magMsd = 5.0
  } else if (magMsd > 1.0) {
    magMsd = 2.0
  }

  const stepSize = magMsd * magPow
  return Math.ceil(range / stepSize) * stepSize
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  let bigint: number
  switch (h.length) {
    case 6:
      bigint = parseInt(h, 16)
      break
    case 3:
      bigint = parseInt(
        h
          .split('')
          .map((d) => d + d)
          .join(''),
        16,
      )
      break
    default:
      throw new Error(`${hex} is not a valid hex color`)
  }
  return [
    (bigint >> 16) & 255, // tslint:disable-line:no-bitwise
    (bigint >> 8) & 255, // tslint:disable-line:no-bitwise
    bigint & 255, // tslint:disable-line:no-bitwise
  ]
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
  // tslint:disable-next-line:no-bitwise
  return '#' + ((1 << 24) + (+r << 16) + (+g << 8) + +b).toString(16).slice(1)
}

export function createRangePathArea(
  data: HistogramBandEntry[],
  scaleX: ScaleTime<number, number>,
  scaleY: ScaleLinear<number, number>,
): string {
  const nonNull = data.filter((v) => isDefined(v.band))
  if (nonNull.length === 0) {
    return ''
  }
  const points = [
    // tslint:disable-next-line:no-non-null-assertion
    ...nonNull.map((v) => [v.date, v.band!.upper] as const),
    // tslint:disable-next-line:no-non-null-assertion
    ...nonNull.map((v) => [v.date, v.band!.lower] as const).reverse(),
  ].map(([xVal, yVal]) => `${scaleX(middleOfDay(xVal))},${scaleY(yVal)}`)
  return `M${points.shift()} L${points.join(' L')} Z`
}

export function defineSteppedGradient(
  gradient: Selection<SVGLinearGradientElement, void, null, undefined>,
  yScale: ScaleLinear<number, number>,
  ranges: number[],
  colors: string[],
  margin: { top: number; bottom: number },
  svg: D3SvgComponent,
) {
  if (colors.length <= ranges.length) {
    throw new Error('exactly one more color than range is needed')
  }
  const maxY = yScale.domain()[1]

  const data = ranges
    .map((r, ix) => [[(maxY - r) / maxY, colors[ix]] as const, [(maxY - r) / maxY, colors[ix + 1]] as const])
    .reduce((u, i) => [...u, ...i], [])
    .reverse()

  gradient
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', margin.top)
    .attr('y2', svg.height - margin.bottom)
    .selectAll('stop')
    .data(data)
    .join('stop')
    .attr('offset', ([v]) => v)
    .attr('stop-color', ([_, c]) => c)
}

export function singleTouchHint(element: Element, showTouchHintSubject: Subject<boolean>) {
  const touchStart$ = fromEvent<TouchEvent>(element, 'touchstart', { capture: true })
  const touchMove$ = fromEvent<TouchEvent>(element, 'touchmove', { capture: true })
  const touchEnd$ = merge(
    fromEvent<TouchEvent>(element, 'touchend', { capture: true }),
    fromEvent<TouchEvent>(element, 'touchcancel', { capture: true }),
  )

  return touchStart$.pipe(
    tap((e) => {
      if (e.touches.length > 1) {
        showTouchHintSubject.next(false)
      }
    }),
    filter((e) => e.touches.length === 1),
    tap((e) => {
      e.stopPropagation()
      e.stopImmediatePropagation()
    }),
    switchMap(() =>
      touchMove$.pipe(
        takeUntil(touchEnd$),
        filter((e) => e.touches.length === 1),
        tap(() => showTouchHintSubject.next(true)),
        // if no touchmove is emited, the last operator would throw without defaultValue
        last(undefined, undefined),
      ),
    ),
    tap(() => showTouchHintSubject.next(false)),
  )
}
