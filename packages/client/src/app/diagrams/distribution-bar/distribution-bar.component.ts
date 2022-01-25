import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'

export interface DistributionBarEntry {
  /** percentage value: 0 - 100 */
  ratio: number | null
  colorCode: string
  isOverlay?: boolean
  patternColorCode?: string
}

export type DistributionBarEntries = DistributionBarEntry[]

@Component({
  selector: 'bag-distribution-bar',
  templateUrl: './distribution-bar.component.html',
  styleUrls: ['./distribution-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributionBarComponent {
  @Input()
  label: string

  @Input()
  entries: DistributionBarEntries | null

  @Input()
  facet?: 'narrow'

  constructor() {}
}
