import { coerceCssPixelValue } from '@angular/cdk/coercion'
import { ConnectedPosition, FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay'
import { ViewportScrollPosition } from '@angular/cdk/scrolling'

type Dimensions = Omit<DOMRect, 'x' | 'y' | 'toJSON'>

/** A simple (x, y) coordinate. */
interface Point {
  x: number
  y: number
}

/** Record of measurements for how an overlay (at a given position) fits into the viewport. */
interface OverlayFit {
  /** Whether the overlay fits completely in the viewport. */
  isCompletelyWithinViewport: boolean

  /** Whether the overlay fits in the viewport on the y-axis. */
  fitsInViewportVertically: boolean

  /** Whether the overlay fits in the viewport on the x-axis. */
  fitsInViewportHorizontally: boolean

  /** The total visible area (in px^2) of the overlay inside the viewport. */
  visibleArea: number
}

// tslint:disable:no-unused-variable

// @ts-ignore
export class FlexibleConnectedPositionStrategy2 extends FlexibleConnectedPositionStrategy {
  /** Narrows the given viewport rect by the current _viewportMargin. */
  private override _getNarrowedViewportRect(): Dimensions {
    // the problem: the viewport changes on mobile browsers depending the scroll direction
    // window innerHeight/innerWidth correctly handles this changes but does not consider scrollbars
    // documentElement clientHeight/clientWidth correctly handles the scrollbars but not the viewport changes
    //
    // therefore we use `clientWidth` for the width and `innerHeight` for the height
    // this works for use because we never have horizontal scrollbars

    // @ts-ignore
    const viewportMargin = this._viewportMargin

    // @ts-ignore
    const docEl = this._document.documentElement

    // @ts-ignore
    const scrollPosition = this._viewportRuler.getViewportScrollPosition()

    const width = docEl.clientWidth
    const height = window?.innerHeight ?? docEl.clientHeight

    return {
      top: scrollPosition.top + viewportMargin,
      left: scrollPosition.left + viewportMargin,
      right: scrollPosition.left + width - viewportMargin,
      bottom: scrollPosition.top + height - viewportMargin,
      width: width - 2 * viewportMargin,
      height: height - 2 * viewportMargin,
    }
  }

  private override _getOverlayFit(
    point: Point,
    rawOverlayRect: Dimensions,
    viewport: Dimensions,
    position: ConnectedPosition,
  ): OverlayFit {
    // Round the overlay rect when comparing against the
    // viewport, because the viewport is always rounded.
    const overlay = getRoundedBoundingClientRect(rawOverlayRect)

    let { x, y } = point
    // @ts-ignore
    const offsetX = this._getOffset(position, 'x')
    // @ts-ignore
    const offsetY = this._getOffset(position, 'y')
    // Account for the offsets since they could push the overlay out of the viewport.
    if (offsetX) {
      x += offsetX
    }
    if (offsetY) {
      y += offsetY
    }
    // How much the overlay would overflow at this position, on each side.
    const leftOverflow = 0 - x
    const rightOverflow = x + overlay.width - viewport.width
    const topOverflow = 0 - y
    const bottomOverflow = y + overlay.height - viewport.height
    // Visible parts of the element on each axis.
    // @ts-ignore
    const visibleWidth = this._subtractOverflows(overlay.width, leftOverflow, rightOverflow)
    // @ts-ignore
    const visibleHeight = this._subtractOverflows(overlay.height, topOverflow, bottomOverflow)

    //  IF the visible area is negative, we need to invert the order for the best fallback
    // otherwise the least ideal will be chosen. eg.
    //    A: visibleWidth: 10 * visibleHeight: -10  =  -100
    //    B: visibleWidth: 5 * visibleHeight: -10   =  -50 --> B > A, but B is less ideal
    //    C: visibleWidth: -10 * visibleHeight: -10 =   100 --> C is the worst, gets the biggest area
    const visibleArea =
      visibleWidth < 0 && visibleHeight < 0
        ? Number.MIN_SAFE_INTEGER
        : visibleWidth < 0 || visibleHeight < 0
        ? Number.MIN_SAFE_INTEGER + Math.abs(visibleWidth * visibleHeight)
        : visibleWidth * visibleHeight

    return {
      visibleArea,
      isCompletelyWithinViewport: overlay.width * overlay.height === visibleArea,
      fitsInViewportVertically: visibleHeight === overlay.height,
      fitsInViewportHorizontally: visibleWidth === overlay.width,
    }
  }

  /** Gets the exact top/bottom for the overlay when not using flexible sizing or when pushing. */
  private override _getExactOverlayY(
    position: ConnectedPosition,
    originPoint: Point,
    scrollPosition: ViewportScrollPosition,
  ) {
    // Reset any existing styles. This is necessary in case the
    // preferred position has changed since the last `apply`.
    const styles = { top: '', bottom: '' } as CSSStyleDeclaration
    // @ts-ignore
    let overlayPoint = this._getOverlayPoint(originPoint, this._overlayRect, position)

    // @ts-ignore
    if (this._isPushed) {
      // @ts-ignore
      overlayPoint = this._pushOverlayOnScreen(overlayPoint, this._overlayRect, scrollPosition)
    }

    // @ts-ignore
    const virtualKeyboardOffset = this._overlayContainer.getContainerElement().getBoundingClientRect().top

    // Normally this would be zero, however when the overlay is attached to an input (e.g. in an
    // autocomplete), mobile browsers will shift everything in order to put the input in the middle
    // of the screen and to make space for the virtual keyboard. We need to account for this offset,
    // otherwise our positioning will be thrown off.
    overlayPoint.y -= virtualKeyboardOffset

    // We want to set either `top` or `bottom` based on whether the overlay wants to appear
    // above or below the origin and the direction in which the element will expand.
    if (position.overlayY === 'bottom') {
      // When using `bottom`, we adjust the y position such that it is the distance
      // from the bottom of the viewport rather than the top.

      // @ts-ignore
      const docEl = this._document.documentElement

      // THIS IS OUR FIX HERE: innerHeight instead of clientHeight
      const documentHeight = window?.innerHeight ?? docEl.clientHeight

      // @ts-ignore
      styles.bottom = `${documentHeight - (overlayPoint.y + this._overlayRect.height)}px`
    } else {
      styles.top = coerceCssPixelValue(overlayPoint.y)
    }

    return styles
  }
}

/**
 * Gets a version of an element's bounding `ClientRect` where all the values are rounded down to
 * the nearest pixel. This allows us to account for the cases where there may be sub-pixel
 * deviations in the `ClientRect` returned by the browser (e.g. when zoomed in with a percentage
 * size, see #21350).
 */
function getRoundedBoundingClientRect(clientRect: Dimensions): Dimensions {
  return {
    top: Math.floor(clientRect.top),
    right: Math.floor(clientRect.right),
    bottom: Math.floor(clientRect.bottom),
    left: Math.floor(clientRect.left),
    width: Math.floor(clientRect.width),
    height: Math.floor(clientRect.height),
  }
}
