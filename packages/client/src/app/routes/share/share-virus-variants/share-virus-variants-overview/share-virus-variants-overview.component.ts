import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CovidVirusVariantsGeographyDataV2 } from '@c19/commons'
import { ShareVirusVariantsBaseComponent } from '../share-virus-variants-base.component'

@Component({
  selector: 'bag-share-virus-variants-overview',
  template: `
    <bag-detail-card-virus-variants-overview
      [data]="data"
      [facet]="facet"
      [infoAddOnKey]="introKey"
      [hideInfo]="hideInfo"
    ></bag-detail-card-virus-variants-overview>
  `,
  styleUrls: ['../share-virus-variants-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareVirusVariantsOverviewComponent extends ShareVirusVariantsBaseComponent<CovidVirusVariantsGeographyDataV2> {}
