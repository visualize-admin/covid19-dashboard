import { ChangeDetectionStrategy, Component } from '@angular/core'
import { HospCapacityDevelopmentData } from '@c19/commons'
import { ShareHospCapacityBaseComponent } from '../share-hosp-capacity-base.component'

@Component({
  template: `
    <bag-detail-card-hosp-capacity-development
      [facet]="isExport ? 'print' : null"
      [data]="data"
      [infoAddOnKey]="introKey"
      [hideInfo]="hideInfo"
    ></bag-detail-card-hosp-capacity-development>
  `,
  styleUrls: ['../share-hosp-capacity-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareHospCapacityDevelopmentComponent extends ShareHospCapacityBaseComponent<HospCapacityDevelopmentData> {}
