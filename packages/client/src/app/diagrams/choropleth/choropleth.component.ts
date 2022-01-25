import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { D3SvgComponent } from '../../shared/components/d3-svg/d3-svg.component'
import { BaseChoroplethComponent, ChoroplethGeoFeature } from './base-choropleth.component'

export type FillFn<T = any> = (feature: ChoroplethGeoFeature<T>, instance: D3SvgComponent) => string | null

const NULL_FN = () => null

@Component({
  selector: 'bag-choropleth',
  templateUrl: './choropleth.component.html',
  styleUrls: ['./choropleth.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--vh.px]': 'initialVh || 0',
    '[class.--no-vh-var]': 'initialVh === 0',
  },
})
export class ChoroplethComponent<T> extends BaseChoroplethComponent<T> {
  @Input()
  fillFn: FillFn<T> = NULL_FN

  @Input()
  maskFn: FillFn<T> = NULL_FN

  protected getFill(feature: ChoroplethGeoFeature<T>): string | null {
    return this.fillFn(feature, this.svg)
  }

  protected getMask(feature: ChoroplethGeoFeature<T>): string | null {
    return this.maskFn(feature, this.svg)
  }
}
