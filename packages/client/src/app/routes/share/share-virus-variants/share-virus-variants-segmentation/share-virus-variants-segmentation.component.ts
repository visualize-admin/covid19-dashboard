import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CovidVirusVariantsWgsDevelopmentData } from '@c19/commons'
import { ShareVirusVariantsBaseComponent } from '../share-virus-variants-base.component'

@Component({
  selector: 'bag-share-virus-variants-segmentation',
  template: `
    <bag-detail-card-virus-variants-segmentation
      [data]="data"
      [facet]="facet"
      [infoAddOnKey]="introKey"
      [hideInfo]="hideInfo"
      [hideResetBtn]="true"
    ></bag-detail-card-virus-variants-segmentation>
  `,
  styleUrls: ['../share-virus-variants-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareVirusVariantsSegmentationComponent extends ShareVirusVariantsBaseComponent<CovidVirusVariantsWgsDevelopmentData> {}
