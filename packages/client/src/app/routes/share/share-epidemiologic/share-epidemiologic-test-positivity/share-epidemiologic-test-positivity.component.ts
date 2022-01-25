import { ChangeDetectionStrategy, Component } from '@angular/core'
import { EpidemiologicTestDevelopmentData } from '@c19/commons'
import { ShareEpidemiologicBaseComponent } from '../share-epidemiologic-base.component'

@Component({
  selector: 'bag-share-epidemiologic-test-positivity',
  template: `
    <bag-detail-card-epidemiologic-test-positivity
      [facet]="facet"
      [data]="data"
      [infoAddOnKey]="introKeyEpi"
      [hideInfo]="hideInfo"
    ></bag-detail-card-epidemiologic-test-positivity>
  `,
  styleUrls: ['../share-epidemiologic-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareEpidemiologicTestPositivityComponent extends ShareEpidemiologicBaseComponent<EpidemiologicTestDevelopmentData> {}
