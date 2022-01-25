import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'bag-quarantine-legend',
  templateUrl: './quarantine-legend.component.html',
  styleUrls: ['./quarantine-legend.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuarantineLegendComponent {
  @Input()
  labelQuarantine: string

  @Input()
  labelQuarantineTo?: string | null

  @Input()
  labelQuarantineFrom?: string | null

  @Input()
  labelNoQuarantine: string
}
