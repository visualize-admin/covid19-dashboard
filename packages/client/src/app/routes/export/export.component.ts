import { ChangeDetectionStrategy, Component } from '@angular/core'
import { TRANSLATOR_PROVIDER } from '../../core/i18n/translator-provider.const'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'

@Component({
  selector: 'bag-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TRANSLATOR_PROVIDER, TooltipService],
})
export class ExportComponent {
  constructor() {}
}
