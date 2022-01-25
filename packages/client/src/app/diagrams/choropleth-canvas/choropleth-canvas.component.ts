import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { ChoroplethGeoFeature } from '../choropleth/base-choropleth.component'
import { BaseChoroplethCanvasComponent } from './base-choropleth-canvas.component'

export type FillFn<T = any> = (feature: ChoroplethGeoFeature<T>) => string | null

const NULL_FN = () => null

@Component({
  selector: 'bag-choropleth-canvas',
  templateUrl: './choropleth-canvas.component.html',
  styleUrls: ['./choropleth-canvas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoroplethCanvasComponent<T> extends BaseChoroplethCanvasComponent<T> {
  @Input()
  fillFn: FillFn<T> = NULL_FN

  protected getFill(feature: ChoroplethGeoFeature<T>): string | null {
    return this.fillFn(feature)
  }
}
