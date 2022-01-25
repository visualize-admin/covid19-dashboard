import { ChangeDetectionStrategy, Component } from '@angular/core'
import { EpidemiologicSimpleGdi } from '@c19/commons'
import { EpidemiologicBaseDetailComponent } from '../epidemiologic-base-detail.component'

@Component({
  selector: 'bag-detail-hosp',
  templateUrl: './detail-hosp.component.html',
  styleUrls: ['../../base-detail.component.scss', '../epidemiologic-base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailHospComponent extends EpidemiologicBaseDetailComponent {
  readonly simpleGdi = EpidemiologicSimpleGdi.HOSP
}
