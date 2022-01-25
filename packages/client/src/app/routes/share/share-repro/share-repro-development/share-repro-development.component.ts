import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ReDevelopment } from '@c19/commons'
import { ShareReproBaseComponent } from '../share-repro-base.component'

@Component({
  template: `
    <bag-detail-card-repro-development [infoAddOnKey]="infoAddOnKey" [shareMode]="true" [facet]="facet" [data]="data">
    </bag-detail-card-repro-development>
  `,
  styleUrls: ['../share-repro-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareReproDevelopmentComponent extends ShareReproBaseComponent<ReDevelopment> {}
