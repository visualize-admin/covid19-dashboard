import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { GeoUnit, isDefined, TopLevelGeoUnit } from '@c19/commons'
import { formatUtcDate } from '../../../../static-utils/date-utils'
import { BaseTooltipContentComponent } from '../base-tooltip-content.component'

export type TooltipWithBoundsLabelKeys =
  | 'upperBound'
  | 'upperBoundRef'
  | 'lowerBound'
  | 'lowerBoundRef'
  | 'value'
  | 'valueRef'
  | 'value7d'
  | 'value7dRef'
  | 'refValue'
export type TooltipWithBoundsLabels = Record<TooltipWithBoundsLabelKeys, string>

export interface TooltipWithBoundsValues {
  high: number | null
  low: number | null
  value: number | null
  value7d?: number | null
}

export interface TooltipBoundsContentData {
  date: Date
  geoUnit?: GeoUnit
  values: TooltipWithBoundsValues | null

  labels: Partial<TooltipWithBoundsLabels>
  isPercentage?: boolean

  refGeoUnit?: TopLevelGeoUnit | null
  refValue?: number | null
}

@Component({
  selector: 'bag-tooltip-bounds-content',
  templateUrl: './tooltip-bounds-content.component.html',
  styleUrls: ['./tooltip-bounds-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipBoundsContentComponent extends BaseTooltipContentComponent<TooltipBoundsContentData> {
  readonly isDefined = isDefined

  get labels(): TooltipWithBoundsLabels {
    return <any>this.data.labels
  }

  get title(): string {
    return formatUtcDate(this.data.date)
  }

  get hasRef(): boolean {
    return isDefined(this.data.refValue) && isDefined(this.data.refGeoUnit)
  }

  get has7dayMean(): boolean {
    return this.data.values?.value7d !== undefined
  }

  get refGeoUnitLabel(): string | null {
    return this.data.refGeoUnit === TopLevelGeoUnit.CHFL ? 'CH+FL' : this.data.refGeoUnit ?? null
  }
}
