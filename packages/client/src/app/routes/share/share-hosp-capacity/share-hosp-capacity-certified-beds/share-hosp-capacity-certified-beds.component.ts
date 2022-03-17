import { ChangeDetectionStrategy, Component } from '@angular/core'
import { HospCapacityCertAdhocDevelopmentData } from '@c19/commons'
import { ShareHospCapacityBaseComponent } from '../share-hosp-capacity-base.component'

@Component({
  template: `
    <bag-detail-card-hosp-capacity-certified-beds
      [facet]="isExport ? 'print' : null"
      [data]="data"
      [infoAddOnKey]="introKey"
      [hideInfo]="hideInfo"
    ></bag-detail-card-hosp-capacity-certified-beds>
  `,
  styleUrls: ['../share-hosp-capacity-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareHospCapacityCertifiedBedsComponent extends ShareHospCapacityBaseComponent<HospCapacityCertAdhocDevelopmentData> {}
