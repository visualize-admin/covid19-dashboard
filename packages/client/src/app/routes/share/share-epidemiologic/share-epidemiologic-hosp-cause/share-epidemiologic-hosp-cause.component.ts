import { ChangeDetectionStrategy, Component } from '@angular/core'
import { HospReasonAgeRangeData } from '@c19/commons'
import { ShareEpidemiologicBaseComponent } from '../share-epidemiologic-base.component'

@Component({
  selector: 'bag-share-epidemiologic-hosp-cause',
  template: `
    <bag-detail-card-epidemiologic-hosp-cause
      [facet]="facet"
      [data]="data"
      [infoAddOnKey]="introKeyEpi"
      [hideInfo]="hideInfo"
    ></bag-detail-card-epidemiologic-hosp-cause>
  `,
  styleUrls: ['../share-epidemiologic-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareEpidemiologicHospCauseComponent extends ShareEpidemiologicBaseComponent<HospReasonAgeRangeData> {}
