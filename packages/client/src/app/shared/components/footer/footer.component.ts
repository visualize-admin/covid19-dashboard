import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { UriService } from '../../../core/uri.service'

@Component({
  selector: 'bag-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly downloads = this.uriService.getDownloadDefinitions()

  constructor(private readonly uriService: UriService) {}
}
