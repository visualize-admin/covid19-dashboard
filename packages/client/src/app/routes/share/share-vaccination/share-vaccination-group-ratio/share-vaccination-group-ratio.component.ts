import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { EpidemiologicVaccIndicationDevelopmentData } from '@c19/commons'
import { ShareVaccinationBaseComponent } from '../share-vaccination-base.component'

@Component({
  selector: 'bag-share-vaccination-group-ratio',
  templateUrl: './share-vaccination-group-ratio.component.html',
  styleUrls: ['../share-vaccination-base.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareVaccinationGroupRatioComponent extends ShareVaccinationBaseComponent<EpidemiologicVaccIndicationDevelopmentData> {}
