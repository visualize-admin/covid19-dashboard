import { ChangeDetectionStrategy, Component } from '@angular/core'
import { EpidemiologicDevelopmentData, EpidemiologicTestDevelopmentData } from '@c19/commons'
import { ShareEpidemiologicBaseComponent } from '../share-epidemiologic-base.component'

@Component({
  selector: 'bag-share-epidemiologic-development',
  template: `
    <bag-detail-card-epidemiologic-development
      [facet]="facet"
      [data]="data"
      [infoAddOnKey]="introKeyEpi"
      [hideInfo]="hideInfo"
    ></bag-detail-card-epidemiologic-development>
  `,
  styleUrls: ['../share-epidemiologic-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareEpidemiologicDevelopmentComponent extends ShareEpidemiologicBaseComponent<
  EpidemiologicDevelopmentData | EpidemiologicTestDevelopmentData
> {}
