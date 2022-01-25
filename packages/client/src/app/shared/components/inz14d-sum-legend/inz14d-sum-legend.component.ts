import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'bag-inz14d-sum-legend',
  templateUrl: './inz14d-sum-legend.component.html',
  styleUrls: ['./inz14d-sum-legend.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inz14dSumLegendComponent {
  @Input()
  titleKey: string

  @Input()
  noCasesKey?: string

  @Input()
  noDataKey?: string
}
