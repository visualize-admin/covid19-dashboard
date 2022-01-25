// tslint:disable:max-classes-per-file

import { Type } from '@angular/core'
import { GeoContext } from 'd3'

/** Noop Implementation of GeoContext */
class NoopGeoContext {
  arc() {}

  beginPath() {}

  closePath() {}

  lineTo() {}

  moveTo() {}
}

// fallback for ssr is necessary
// tslint:disable-next-line:variable-name
const Path2dImplementation: Type<Path2D> = <any>(typeof Path2D !== 'undefined' ? Path2D : NoopGeoContext)

export class Path2dContext extends Path2dImplementation implements GeoContext {
  beginPath(): void {}
}
