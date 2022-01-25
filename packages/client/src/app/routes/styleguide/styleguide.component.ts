import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { TRANSLATOR_PROVIDER } from '../../core/i18n/translator-provider.const'
import { TooltipService } from '../../shared/components/tooltip/tooltip.service'

@Component({
  selector: 'bag-styleguide',
  templateUrl: './styleguide.component.html',
  styleUrls: ['./styleguide.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TRANSLATOR_PROVIDER, TooltipService],
})
export class StyleguideComponent {
  links = [
    { path: 'typography', label: 'Typography' },
    { path: 'histogram', label: 'Histogram' },
    { path: 'matrix', label: 'Matrix' },
    { path: 'choropleth', label: 'Maps' },
    { path: 'column-chart', label: 'Column-Chart' },
    { path: 'components', label: 'Components' },
  ]
}
