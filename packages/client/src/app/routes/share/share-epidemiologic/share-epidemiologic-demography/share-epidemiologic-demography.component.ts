import { ChangeDetectionStrategy, Component } from '@angular/core'
import { EpidemiologicDemographyData } from '@c19/commons'
import { ShareEpidemiologicBaseComponent } from '../share-epidemiologic-base.component'

@Component({
  selector: 'bag-share-epidemiologic-demography',
  template: `
    <bag-detail-card-epidemiologic-demography
      [facet]="facet"
      [data]="data"
      [infoAddOnKey]="introKeyEpi"
      [hideInfo]="hideInfo"
    ></bag-detail-card-epidemiologic-demography>
  `,
  styleUrls: ['../share-epidemiologic-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareEpidemiologicDemographyComponent extends ShareEpidemiologicBaseComponent<EpidemiologicDemographyData> {}
