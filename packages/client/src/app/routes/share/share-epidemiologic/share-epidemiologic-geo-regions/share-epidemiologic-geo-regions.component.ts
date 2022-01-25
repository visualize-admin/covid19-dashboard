import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ExtraGeoUnitsData } from '@c19/commons'
import { ShareEpidemiologicBaseComponent } from '../share-epidemiologic-base.component'

@Component({
  selector: 'bag-share-epidemiologic-geo-regions',
  template: `
    <bag-detail-card-epidemiologic-geo-regions
      [facet]="facet"
      [infoAddOnKey]="introKeyEpi"
    ></bag-detail-card-epidemiologic-geo-regions>
  `,
  styleUrls: ['../share-epidemiologic-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareEpidemiologicGeoRegionsComponent extends ShareEpidemiologicBaseComponent<ExtraGeoUnitsData> {}
