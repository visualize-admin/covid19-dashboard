import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'bag-repro-legend',
  templateUrl: './repro-legend.component.html',
  styleUrls: ['./repro-legend.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReproLegendComponent {
  @Input()
  titleKey: string

  @Input()
  facet?: 'overview' | 'table'
}
