import { ChangeDetectionStrategy, Component } from '@angular/core'
import { GdiObject } from '@c19/commons'
import { CapacityBaseDetailComponent } from '../capacity-base-detail.component'

@Component({
  selector: 'bag-detail-total',
  templateUrl: './detail-total.component.html',
  styleUrls: ['../../base-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailTotalComponent extends CapacityBaseDetailComponent {
  readonly gdiObject = GdiObject.HOSP_CAPACITY_TOTAL
}
