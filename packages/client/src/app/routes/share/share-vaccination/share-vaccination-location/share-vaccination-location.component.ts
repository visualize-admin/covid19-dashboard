import { ChangeDetectionStrategy, Component } from '@angular/core'
import { EpidemiologicVaccDosesLocationDevelopmentData } from '@c19/commons'
import { ShareVaccinationBaseComponent } from '../share-vaccination-base.component'

@Component({
  selector: 'bag-share-vaccination-location',
  templateUrl: './share-vaccination-location.component.html',
  styleUrls: ['../share-vaccination-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareVaccinationLocationComponent extends ShareVaccinationBaseComponent<EpidemiologicVaccDosesLocationDevelopmentData> {}
